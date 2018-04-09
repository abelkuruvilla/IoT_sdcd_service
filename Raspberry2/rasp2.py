import sys
import paho.mqtt.client as mqtt
import time
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

broker_address = "192.168.1.101"
broker_port = "1883"
webPort = 8000
messageTopic = 'topics/temp'

mySQLhost = "localhost"
mySQLuser = "pi"
mySQLpassword = "raspberry"
mySQLdb = "iotcache"
deviceId = "5ab38259437af5970fca34e4"

db = MySQLdb.connect(mySQLhost, mySQLuser, mySQLpassword, mySQLdb)
cur = db.cursor(MySQLdb.cursors.DictCursor)

time_of_receiving_message = None
time_retrieving_key = None
time_after_decryption = None


class AESCipher:
        def __init__(self, key):
                self.key = hashlib.sha256(key).hexdigest()[:32]
                self.bs = 32
                self.MODE = AES.MODE_CBC
                self.SEGMENT_SIZE = 128
                self.iv = 'This is an IV456'

        def encrypt(self, plaintext):
                aes = AES.new(self.key, self.MODE, self.iv,
                              segment_size=self.SEGMENT_SIZE)
                plaintext = self._pad_string(plaintext)
                encrypted_text = aes.encrypt(plaintext)
                return binascii.b2a_hex(encrypted_text).rstrip()

        def decrypt(self, encrypted_text):
                aes = AES.new(self.key, self.MODE, self.iv,
                              segment_size=self.SEGMENT_SIZE)
                encrypted_text_bytes = binascii.a2b_hex(encrypted_text)
                decrypted_text = aes.decrypt(encrypted_text_bytes)
                decrypted_text = self._unpad_string(decrypted_text)
                return decrypted_text

        def _pad_string(self, value):
                length = len(value)
                pad_size = self.bs - (length % self.bs)
                return value.ljust(length + pad_size, '\x00')

        def _unpad_string(self, value):
                while value[-1] == '\x00':
                        value = value[:-1]
                return value

def check_expired_key(ktmrow):
    expiry_date = ktmrow['val']
    # checking greater than 1 hour
    return expiry_date >= datetime.datetime.today() + datetime.timedelta(hours=1)

def get_decrypt_key_from_server(topic,device_id):
    parameter = {"topic":topic,"deviceId":device_id}
    response = requests.get("http://"+broker_address+":"+str(webPort)+"/getktm",params=parameter)
    data = response.json()
    return data

def save_to_cache(key_details):
    try:
            myDatetime = datetime.datetime.strptime(
            key_details['val'], "%Y-%m-%dT%H:%M:%S.%fZ")
            #myDatetime = datetime.datetime(*map(int, re.split('[^\d]', key_details['val'])[:-1]))
            #myDatetime = (parser.parse(key_details['val']).isoformat())[:19].replace('T',' ')
            #print myDatetime
            cur.execute("INSERT INTO KTM (keyId,keyT,val) values('%s','%s','%s') ON DUPLICATE KEY UPDATE keyT='%s',val='%s' " % ( key_details['_id'], key_details['keyT'], myDatetime, key_details['keyT'], myDatetime))
            db.commit()
    except:
            print 'error'

def getDecryptKey(keyId):
    cur.execute("SELECT * from KTM where keyId='%s'" %(keyId))
    row = cur.fetchone()
    if (row is None) or  (check_expired_key(row) is False):
        key_details = get_decrypt_key_from_server(messageTopic,deviceId)
        save_to_cache(key_details)
        cur.execute("SELECT * from KTM where keyId='%s'" % (keyId))
        row = cur.fetchone()
    return row['keyT']
    


def parse_received_message(message):
    original = json.loads(message)

    keyId = original['keyId']
    key = getDecryptKey(keyId)
    time_retrieving_key = datetime.datetime.now()

    cipher = AESCipher(key)
    decrypt_message = cipher.decrypt(original['data'])
    time_after_decryption = datetime.datetime.now()

    print('Time of retreiving key %s' %(time_retrieving_key.isoformat(' ')))
    print('Time after decrypting message %s' %(time_after_decryption.isoformat(' ')))

    return json.loads(decrypt_message)

def on_message(client, userdata, msg):
    print("    ")
    time_of_receiving_message = datetime.datetime.now()
    print("Message recieved ", str(msg.payload))
    print("Message topic=", msg.topic)
    message = parse_received_message(msg.payload)
    

    # time_send = parser.parse(message['time'] ) 
    # msge = json.loads(msg.payload)
    # time_send = parser.parse(msge['time'])


    # time_difference = time_of_receiving_message - time_send
    # print('Time of receiving message %s' %(time_of_receiving_message.isoformat(' ')))
    
    
    # print('Travelling time %s' %(time_difference.total_seconds() ))
    print('Decrypted Message received= %s' %(message))
    print('')

    print sys.getsizeof(str(msg))
    print sys.getsizeof(message)
    print p.cpu_num()
    print p.cpu_percent()
    print p.cpu_times()
    print p.memory_full_info()
    print('')
        


client = mqtt.Client("P2")

print 'connecting to broker'
client.connect(broker_address, broker_port)


client.on_message = on_message

client.loop_start()

print 'subscribing'
client.subscribe(messageTopic)

while True:
    time.sleep(1)
