import os
import csv
import random
import hashlib
from faker import Faker
from multiprocessing import Process

from utils import *

fake = Faker()
BASE_PATH = os.path.join(os.getcwd(), "resources")

MIN_ROLE_LEVEL = 1
MAX_ROLE_LEVEL = 100

EMPLOYEE_ROLES_COUNT = 1_000_000
EMPLOYEES_COUNT = 1_000_000
STORES_COUNT = 1_000_000
STORE_SHIFTS_COUNT = 10_000_000

USERS_COUNT = 10_000
PASSWORD = hashlib.sha256(b"a").hexdigest()
ACCESS_LEVEL = AccessLevel.Regular.value
PAGE_PREFERENCE = 5


def create_users_csv() -> None:
    print("Begin create_users_csv")
    file = os.path.join(BASE_PATH, "users.csv")

    if os.path.exists(file):
        os.remove(file)

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        unique_names = set()
        for i in range(1, USERS_COUNT + 1):
            while True:
                name = fake.user_name()
                if name not in unique_names:
                    unique_names.add(name)
                    break

            writer.writerow([i, name, PASSWORD, ACCESS_LEVEL])

    print("End create_users_csv")


def create_user_profiles_csv() -> None:
    print("Begin create_user_profiles_csv")
    file = os.path.join(BASE_PATH, "user_profiles.csv")

    genders = list(Gender)
    marital_statuses = list(MaritalStatus)

    if os.path.exists(file):
        os.remove(file)

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        for i in range(1, USERS_COUNT + 1):
            bio = "\n".join(fake.paragraphs(nb=3))
            location = fake.city()
            birthday = fake.date_between(start_date="-60y", end_date="-18y")
            gender = random.choice(genders).value
            marital_status = random.choice(marital_statuses).value

            user_id = i
            writer.writerow(
                [
                    # i,
                    user_id,
                    bio,
                    location,
                    birthday,
                    gender,
                    marital_status,
                    PAGE_PREFERENCE,
                ]
            )

    print("End create_user_profiles_csv")


def create_employee_roles_csv() -> None:
    print("Begin create_employee_roles_csv")
    file = os.path.join(BASE_PATH, "employee_roles.csv")

    if os.path.exists(file):
        os.remove(file)

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        for i in range(1, EMPLOYEE_ROLES_COUNT + 1):
            role_name = fake.job()
            role_desc = "\n".join(fake.paragraphs(nb=3))
            role_level = random.randint(MIN_ROLE_LEVEL, MAX_ROLE_LEVEL)

            user_id = random.randint(1, USERS_COUNT)
            writer.writerow([i, role_name, role_desc, role_level, user_id])

    print("End create_employee_roles_csv")


def create_employees_csv() -> None:
    print("Begin create_employees_csv")
    file = os.path.join(BASE_PATH, "employees.csv")

    genders = list(Gender)

    if os.path.exists(file):
        os.remove(file)

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        for i in range(1, EMPLOYEES_COUNT + 1):
            first_name = fake.first_name()
            last_name = fake.last_name()
            gender = random.choice(genders).value
            employment_date = fake.date_between(start_date="-10y", end_date="today")
            termination_date = (
                fake.date_between(start_date=employment_date, end_date="today")
                if random.random() < 0.2
                else None
            )
            salary = round(random.uniform(30000, 120000), 2)
            role_id = random.randint(1, EMPLOYEE_ROLES_COUNT)

            user_id = random.randint(1, USERS_COUNT)
            writer.writerow(
                [
                    i,
                    first_name,
                    last_name,
                    gender,
                    employment_date,
                    termination_date,
                    salary,
                    role_id,
                    user_id,
                ]
            )

    print("End create_employees_csv")


def create_stores_csv() -> None:
    print("Begin create_stores_csv")
    file = os.path.join(BASE_PATH, "stores.csv")

    categories = list(StoreCategory)

    if os.path.exists(file):
        os.remove(file)

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        for i in range(1, STORES_COUNT + 1):
            store_name = f"{fake.company()} Store"
            store_desc = "\n".join(fake.paragraphs(nb=3))
            category = random.choice(categories).value
            address = fake.street_address()
            city = fake.city()
            state = fake.state_abbr()
            zip_code = fake.zipcode()
            country = fake.country()
            open_date = fake.date_between(start_date="-20y", end_date="today")
            close_date = (
                fake.date_between(start_date=open_date, end_date="today")
                if random.random() < 0.1
                else None
            )

            user_id = random.randint(1, USERS_COUNT)
            writer.writerow(
                [
                    i,
                    store_name,
                    store_desc,
                    category,
                    address,
                    city,
                    state,
                    zip_code,
                    country,
                    open_date,
                    close_date,
                    user_id,
                ]
            )

    print("End create_stores_csv")


def create_store_shifts_csv() -> None:
    print("Begin create_store_shifts_csv")
    file = os.path.join(BASE_PATH, "store_shifts.csv")

    if os.path.exists(file):
        os.remove(file)

    unique_shifts = set()
    for _ in range(STORE_SHIFTS_COUNT):
        while True:
            store_id = random.randint(1, STORES_COUNT)
            employee_id = random.randint(1, EMPLOYEES_COUNT)
            if (store_id, employee_id) not in unique_shifts:
                unique_shifts.add((store_id, employee_id))
                break

    print(f"Generated {len(unique_shifts)} unique shifts. Writing...")

    with open(file, "w", newline="") as f:
        writer = csv.writer(f)

        current = 0
        for store_id, employee_id in unique_shifts:
            start_date = fake.date_between(start_date="-5y", end_date="today")
            end_date = fake.date_between(start_date=start_date, end_date="today")

            user_id = random.randint(1, USERS_COUNT)
            writer.writerow([store_id, employee_id, start_date, end_date, user_id])

            current += 1
            if current % 1000000 == 0:
                print(f"Processed {current} shifts")

    print("End create_store_shifts_csv")


def start_generation() -> None:
    if not os.path.exists(BASE_PATH):
        os.makedirs(BASE_PATH, exist_ok=True)

    processes = []
    for func in [
        create_users_csv,
        create_user_profiles_csv,
        create_employee_roles_csv,
        create_employees_csv,
        create_stores_csv,
        create_store_shifts_csv,
    ]:
        p = Process(target=func)
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    print("\nFinished generating data")
