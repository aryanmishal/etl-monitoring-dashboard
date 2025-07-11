# User model for authentication
class User:
    def __init__(self, id: int, username: str, nickname: str = None, full_name: str = None, password_hash: str = None):
        self.id = id
        self.username = username
        self.nickname = nickname
        self.full_name = full_name
        self.password_hash = password_hash 