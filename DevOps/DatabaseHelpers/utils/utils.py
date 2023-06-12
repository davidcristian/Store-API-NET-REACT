from enum import Enum


class AccessLevel(Enum):
    Unconfirmed = 0
    Regular = 1
    Moderator = 2
    Admin = 3


class MaritalStatus(Enum):
    Single = 0
    Married = 1
    Widowed = 2
    Separated = 3
    Divorced = 4


class Gender(Enum):
    Female = 0
    Male = 1
    Other = 2


class StoreCategory(Enum):
    General = 0
    Food = 1
    Clothing = 2
    Electronics = 3
    Furniture = 4
