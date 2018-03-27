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

client  = mqtt.Client("P1")
serverIp = "192.168.1.100"
serverPort = 1883
webPort = 8000
messageTopic = 'test/temp1'

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
        response = requests.get("http://"+serverIp+":"+str(webPort)+"/sendktm",params=parameter)
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
                print "Expired"
                print (check_expired_key(ktmrow))
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
                self.key = hashlib.sha256(key).digest()
                self.bs = 32

        def encrypt( self, raw ):
                raw = self._pad(raw)
                iv = Random.new().read( AES.block_size )
                cipher = AES.new( self.key, AES.MODE_CBC, iv )
                return base64.b64encode( iv + cipher.encrypt( raw ) )

        def decrypt( self, enc ):
                enc = base64.b64decode(enc)
                iv = enc[:AES.block_size]
                cipher = AES.new(self.key, AES.MODE_CBC, iv )
                return self._unpad(cipher.decrypt( enc[AES.block_size:] ))

        def _pad(self,s) :
                return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)
        
        def _unpad(self,s):
                return s[0:-ord(s[-1])]

topic_row , key_row =  check_ktm_cache("topics/temp")

keyT = key_row['keyT']
cipher = AESCipher(keyT)

# enc = cipher.encrypt("myname is abel")
# dnc = cipher.decrypt(enc)


while True:
        humidity, temperature = Adafruit_DHT.read_retry(11,4)
        print 'Sensing : Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(temperature, humidity)
        #print 'Temperature: '+temp

        data = {'temperature':temperature,'humidity':humidity}
        final_data = {'keyId' : key_row['keyId'] , 'data': cipher.encrypt(json.dumps(data))}
        json_data = json.dumps(final_data)


        client.connect(serverIp,serverPort)

        client.publish(messageTopic,json_data)
        print 'Published data to broker'
