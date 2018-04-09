import sys
import Adafruit_DHT
import paho.mqtt.client as mqtt
import json
import MySQLdb
import socket
import requests
import datetime
import re
import dateutil.parser as parser
from Crypto.Cipher import AES
from Crypto import Random
import hashlib
import base64
import binascii
import psutil,os


p = psutil.Process(os.getpid())

client  = mqtt.Client("P1")
serverIp = "192.168.1.101"
serverPort = 1883
webPort = 8000
messageTopic = 'topics/temp'

mySQLhost = "localhost"
mySQLuser = "pi"
mySQLpassword = "raspberry"
mySQLdb = "iotcache"
deviceId = "5ab38259437af5970fca52e0"

db = MySQLdb.connect(mySQLhost,mySQLuser,mySQLpassword,mySQLdb)
cur = db.cursor(MySQLdb.cursors.DictCursor)





        

def getIp():
        return ((([ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] or [[(s.connect(
                ("8.8.8.8", 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]]) + ["no IP found"])[0])

def get_key_from_server(topic,device_id):
        parameter = {"topic":topic,"deviceId":device_id}
        stri = "http://%s:%s/sendktm" % (serverIp, str(webPort))
  
        response = requests.get(stri,params=parameter)
        
        data = response.json()
        return data['topic'],data['key']
def save_to_cache(topic_details,key_details,type_renew='new'):
        try:
                myDatetime = datetime.datetime.strptime(key_details['val'], "%Y-%m-%dT%H:%M:%S.%fZ")
                #myDatetime = datetime.datetime(*map(int, re.split('[^\d]', key_details['val'])[:-1]))
                #myDatetime = (parser.parse(key_details['val']).isoformat())[:19].replace('T',' ')
                #print myDatetime
                if type_renew != 'renew':
                        cur.execute('INSERT INTO Topics values("%s","%s","%s","%s")' %(topic_details['_id'], topic_details['key_id'], topic_details['topic_name'], topic_details['type']))
                        db.commit()
                cur.execute("INSERT INTO KTM (keyId,keyT,val) values('%s','%s','%s') ON DUPLICATE KEY UPDATE keyT='%s',val='%s' " %(key_details['_id'], key_details['keyT'], myDatetime, key_details['keyT'], myDatetime) )
                db.commit()
        except:
                print 'error'

def check_expired_key(ktmrow):
        expiry_date = ktmrow['val']
        return expiry_date >= datetime.datetime.today() + datetime.timedelta(hours=1) #checking greater than 1 hour


def check_ktm_cache(topic):
        cur.execute("SELECT * from Topics where topic_name='"+topic+"'")
        row = cur.fetchone()
        if (row is None) or (row['key_id'] is None):
                
                topic_details, key_details = get_key_from_server(topic,deviceId)
                save_to_cache(topic_details,key_details)
        else :
                key_id = row['key_id']
                cur.execute("SELECT * from KTM where keyId='%s'" %(key_id))
                ktmrow = cur.fetchone()
                if (not check_expired_key(ktmrow)):
                        topic_details, key_details = get_key_from_server(topic, deviceId)
                        save_to_cache(topic_details, key_details,'renew')
        cur.execute("SELECT * from Topics where topic_name='%s'" %(topic))
        return_topic_details = cur.fetchone()
        cur.execute("SELECT * from KTM where keyId='%s'" %(return_topic_details['key_id']))   
        return_key_details = cur.fetchone()

        return return_topic_details,return_key_details             


class AESCipher : 
        def __init__( self, key ):
                self.key = hashlib.sha256(key).hexdigest()[:32]
                self.bs = 32
                self.MODE = AES.MODE_CBC
                self.SEGMENT_SIZE = 128
                self.iv = 'This is an IV456'

        def encrypt( self, plaintext ):
                aes = AES.new(self.key, self.MODE, self.iv, segment_size=self.SEGMENT_SIZE)
                plaintext = self._pad_string(plaintext)
                encrypted_text = aes.encrypt(plaintext)
                return binascii.b2a_hex(encrypted_text).rstrip()

        def decrypt( self, encrypted_text ):
                aes = AES.new(self.key, self.MODE, self.iv, segment_size=self.SEGMENT_SIZE)
                encrypted_text_bytes = binascii.a2b_hex(encrypted_text)
                decrypted_text = aes.decrypt(encrypted_text_bytes)
                decrypted_text = self._unpad_string(decrypted_text)
                return decrypted_text

        def _pad_string(self,value):
                length = len(value)
                pad_size = self.bs - (length % self.bs)
                return value.ljust(length + pad_size, '\x00')


        def _unpad_string(self,value):
                while value[-1] == '\x00':
                        value = value[:-1]
                return value

topic_row , key_row =  check_ktm_cache(messageTopic)

keyT = key_row['keyT']
cipher = AESCipher(keyT)

# enc = cipher.encrypt("myname is abel")
# dnc = cipher.decrypt(enc)
client.connect(serverIp, serverPort)

time_before_getting_sensor_data = None
time_after_sensor_data = None
time_after_normalization = None
time_after_encrypting = None
time_of_publishing = None
# while True:

# time_before_getting_sensor_data = datetime.datetime.now()

humidity, temperature = Adafruit_DHT.read_retry(11,4)

time_after_sensor_data = datetime.datetime.now()
print 'Sensing : Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(temperature, humidity)
#print 'Temperature: '+temp

data = {'temperature':temperature,'humidity':humidity,'time':time_after_sensor_data.isoformat(' '),'deviceId':deviceId}
# time_after_normalization = datetime.datetime.now()

enc = cipher.encrypt(json.dumps(data))
# time_after_encrypting = datetime.datetime.now()

final_data = {'keyId' : key_row['keyId'] , 'data':enc }
json_data = json.dumps(final_data)
# json_data = json.dumps({'keyId': key_row['keyId'], 'data': data})



time_of_publishing = datetime.datetime.now()
client.publish(messageTopic,json_data)

print 'Published data to broker'
# print('time differences:')
# print('Before sensor data %s' %(time_before_getting_sensor_data.isoformat(' ')) )
# print('After sensor data %s' %(time_after_sensor_data.isoformat(' ')) )
# print('After normalization %s' %(time_after_normalization.isoformat(' ')) )
# print('After encryption %s' %(time_after_encrypting.isoformat(' ')) )
# print('At publishing %s' %(time_of_publishing.isoformat(' ')) )
print('')

print sys.getsizeof(json_data)
print p.cpu_num()
print p.cpu_percent()
print p.cpu_times()
print p.memory_full_info()

print('')
