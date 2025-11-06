import json
from channels.generic.websocket import WebsocketConsumer

class Consumer(WebsocketConsumer):
    def connect(self):
        print("WS scope.type:", self.scope.get("type"))
        print("WS path:", self.scope.get("path"))
        self.accept()
        self.send(text_data=json.dumps({
            'message': 'Test'
        }))
    
    def disconnect(self, close_code):
        pass
    
    def receive(self, text_data):
        pass