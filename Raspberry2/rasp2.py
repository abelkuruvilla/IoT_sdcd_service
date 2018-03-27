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

broker_address = "192.168.1.100"
broker_port = "1883"
webPort = 8000
messageTopic = 'test/temp1'

mySQLhost = "localhost"
mySQLuser = "pi"
mySQLpassword = "raspberry"
mySQLdb = "iotcache"
deviceId = "5ab38259437af5970fca34e4"

db = MySQLdb.connect(mySQLhost, mySQLuser, mySQLpassword, mySQLdb)
cur = db.cursor(MySQLdb.cursors.DictCursor)

class AESCipher:
        def __init__(self, key):
                self.key = hashlib.sha256(key).digest()
                self.bs = 32

        def encrypt(self, raw):
                raw = self._pad(raw)
                iv = Random.new().read(AES.block_size)
                cipher = AES.new(self.key, AES.MODE_CBC, iv)
                return base64.b64encode(iv + cipher.encrypt(raw))

        def decrypt(self, enc):
                enc = base64.b64decode(enc)
                iv = enc[:AES.block_size]
                cipher = AES.new(self.key, AES.MODE_CBC, iv)
                return self._unpad(cipher.decrypt(enc[AES.block_size:]))

        def _pad(self, s):
                return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)

        def _unpad(self, s):
                return s[0:-ord(s[-1])]


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
    print row
    print check_expired_key(row)
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
    cipher = AESCipher(key)
    decrypt_message = cipher.decrypt(original['data'])
    return decrypt_message

def on_message(client, userdata, msg):
    print("    ")
    print("Message recieved ", str(msg.payload))
    print("Message topic=", msg.topic)
    message = parse_received_message(msg.payload)
    print('Decrypted Message received= %s' %(message))
        


client = mqtt.Client("P2")

print 'connecting to broker'
client.connect(broker_address, broker_port)


client.on_message = on_message

client.loop_start()

print 'subscribing'
client.subscribe(messageTopic)

while True:
    time.sleep(1)
