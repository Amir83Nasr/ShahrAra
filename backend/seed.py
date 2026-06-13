"""Seed the database with sample data for development and testing."""

import random
import uuid
from datetime import datetime, timedelta, timezone

from app.core.config import ADMIN_NATIONAL_ID, ADMIN_PHONE
from app.db.session import Base, SessionLocal, engine
from app.models.models import Request, User

Base.metadata.create_all(bind=engine)

USERS = [
    {
        "phone": "09121111111",
        "national_id": "1111111111",
        "first_name": "زهرا",
        "last_name": "احمدی",
    },
    {
        "phone": "09122222222",
        "national_id": "2222222222",
        "first_name": "محمد",
        "last_name": "کریمی",
    },
    {
        "phone": "09123333333",
        "national_id": "3333333333",
        "first_name": "سارا",
        "last_name": "موسوی",
    },
    {
        "phone": "09124444444",
        "national_id": "4444444444",
        "first_name": "امیر",
        "last_name": "حسینی",
    },
    {
        "phone": "09125555555",
        "national_id": "5555555555",
        "first_name": "مریم",
        "last_name": "رضایی",
    },
]

CATEGORIES = [
    "آسفالت و معابر",
    "زیباسازی و فضای سبز",
    "روشنایی و برق شهری",
    "مدیریت پسماند و بازیافت",
    "ترافیک و حمل و نقل",
    "مناسب‌سازی و خدمات اجتماعی",
    "سایر",
]

REGIONS = [
    "منطقه ۱ (شمال قم)",
    "منطقه ۲ (مرکز قم)",
    "منطقه ۳ (شرق قم)",
    "منطقه ۴ (غرب قم)",
    "منطقه ۵ (جنوب قم)",
]

STATUSES = ["submitted", "under_review", "in_progress", "resolved", "archived"]

REQUESTS = [
    {
        "title": "چاله بزرگ در خیابان چهارمردان",
        "description": "یک چاله عمیق در خیابان چهارمردان، نزدیک میدان روح‌الله ایجاد شده که باعث تصادف چند خودرو شده است.",
        "type": "problem",
        "category": "آسفالت و معابر",
        "lat": 34.6460,
        "lng": 50.8800,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "in_progress",
        "likes": 12,
        "admin_response": "در دستور کار تیم راهداری قرار گرفت.",
    },
    {
        "title": "نورپردازی بوستان علوی",
        "description": "بوستان علوی در شب بسیار تاریک است و امکانات نوری کافی ندارد. ساکنان منطقه از امنیت محل نگران هستند.",
        "type": "problem",
        "category": "روشنایی و برق شهری",
        "lat": 34.6400,
        "lng": 50.8700,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "under_review",
        "likes": 8,
        "admin_response": None,
    },
    {
        "title": "ایجاد پیاده‌رو در بلوار پیامبر اعظم",
        "description": "بخش شرقی بلوار پیامبر اعظم پیاده‌رو ندارد و عابران مجبورند از خیابان عبور کنند. پیشنهاد می‌کنم پیاده‌رو احداث شود.",
        "type": "idea",
        "category": "مناسب‌سازی و خدمات اجتماعی",
        "lat": 34.6350,
        "lng": 50.8950,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "resolved",
        "likes": 24,
        "admin_response": "ساخت پیاده‌رو در برنامه سال جاری شهرداری قرار گرفت و به اتمام رسید.",
    },
    {
        "title": "نقص فاضلاب در شهرک قدس",
        "description": "فاضلاب خیابان گلستان شهرک قدس سرریز کرده و بوی نامطبوع باعث آزار ساکنین شده است.",
        "type": "problem",
        "category": "مدیریت پسماند و بازیافت",
        "lat": 34.6650,
        "lng": 50.8600,
        "region": "منطقه ۴ (غرب قم)",
        "status": "in_progress",
        "likes": 15,
        "admin_response": "تیم خدمات شهری به محل اعزام شدند.",
    },
    {
        "title": "ایستگاه دوچرخه اشتراکی در حرم حضرت معصومه",
        "description": "محوطه اطراف حرم مطهر محل مناسبی برای ایستگاه دوچرخه اشتراکی است. این کار به کاهش ترافیک و آلودگی هوا کمک می‌کند.",
        "type": "idea",
        "category": "زیباسازی و فضای سبز",
        "lat": 34.6420,
        "lng": 50.8780,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "submitted",
        "likes": 6,
        "admin_response": None,
    },
    {
        "title": "آسفالت فرسوده بلوار امین",
        "description": "آسفالت بلوار امین در محدوده میدان جهاد به شدت آسیب دیده و نیاز به ترمیم اساسی دارد.",
        "type": "problem",
        "category": "آسفالت و معابر",
        "lat": 34.6550,
        "lng": 50.8850,
        "region": "منطقه ۱ (شمال قم)",
        "status": "submitted",
        "likes": 3,
        "admin_response": None,
    },
    {
        "title": "جمع‌آوری آب‌های سطحی در خیابان طالقانی",
        "description": "با کوچکترین بارش باران، خیابان طالقانی پایین‌تر از میدان روح‌الله دچار آبگرفتگی شدید می‌شود.",
        "type": "problem",
        "category": "آسفالت و معابر",
        "lat": 34.6480,
        "lng": 50.8750,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "under_review",
        "likes": 18,
        "admin_response": None,
    },
    {
        "title": "سطل زباله کم در بوستان شهید بنیادی",
        "description": "در بوستان شهید بنیادی تعداد سطل‌های زباله کافی نیست و زباله‌ها در محوطه پخش می‌شوند.",
        "type": "problem",
        "category": "مدیریت پسماند و بازیافت",
        "lat": 34.6300,
        "lng": 50.8850,
        "region": "منطقه ۵ (جنوب قم)",
        "status": "resolved",
        "likes": 5,
        "admin_response": "سطل‌های جدید نصب شد.",
    },
    {
        "title": "توسعه فضای سبز در منطقه ۴",
        "description": "منطقه ۴ با تراکم جمعیت بالا، کمبود شدید فضای سبز دارد. پیشنهاد تبدیل زمین بایر پشت شهرک قدس به پارک محله‌ای.",
        "type": "idea",
        "category": "زیباسازی و فضای سبز",
        "lat": 34.6600,
        "lng": 50.8400,
        "region": "منطقه ۴ (غرب قم)",
        "status": "submitted",
        "likes": 31,
        "admin_response": None,
    },
    {
        "title": "چراغ راهنمای خراب چهارراه طالقانی",
        "description": "چراغ راهنمایی چهارراه طالقانی - عمار یاسر از سه روز پیش خراب شده و ترافیک سنگینی ایجاد کرده است.",
        "type": "problem",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6430,
        "lng": 50.8830,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "in_progress",
        "likes": 9,
        "admin_response": "تیم فنی در حال تعمیر است.",
    },
    {
        "title": "خط کشی عابر پیاده در میدان روح‌الله",
        "description": "خط کشی عابر پیاده در ضلع جنوبی میدان روح‌الله کاملاً محو شده و خطر تصادف وجود دارد.",
        "type": "problem",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6500,
        "lng": 50.8780,
        "region": "منطقه ۱ (شمال قم)",
        "status": "submitted",
        "likes": 4,
        "admin_response": None,
    },
    {
        "title": "ایجاد کتابخانه دیجیتال در بوستان علوی",
        "description": "پیشنهاد می‌کنم یک کتابخانه دیجیتال روباز در بوستان علوی راه‌اندازی شود تا شهروندان بتوانند در فضای سبز مطالعه کنند.",
        "type": "idea",
        "category": "مناسب‌سازی و خدمات اجتماعی",
        "lat": 34.6380,
        "lng": 50.8680,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "submitted",
        "likes": 14,
        "admin_response": None,
    },
    {
        "title": "نبود رمپ مناسب برای ویلچر در حرم مطهر",
        "description": "ورودی شرقی حرم مطهر حضرت معصومه فاقد رمپ استاندارد برای افراد دارای معلولیت است.",
        "type": "problem",
        "category": "مناسب‌سازی و خدمات اجتماعی",
        "lat": 34.6410,
        "lng": 50.8800,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "under_review",
        "likes": 22,
        "admin_response": None,
    },
    {
        "title": "المپیک و تفریحات شهری",
        "description": "پیشنهاد برگزاری مسابقات ورزشی محله‌ای در پارک‌های منطقه ۳ برای افزایش نشاط اجتماعی.",
        "type": "idea",
        "category": "زیباسازی و فضای سبز",
        "lat": 34.6350,
        "lng": 50.9700,
        "region": "منطقه ۳ (شرق قم)",
        "status": "submitted",
        "likes": 7,
        "admin_response": None,
    },
    {
        "title": "نورپردازی پل عابر پیاده بلوار غدیر",
        "description": "نورپردازی پل عابر پیاده بلوار غدیر در برخی بخش‌ها قطع شده و زیبایی آن را تحت تأثیر قرار داده است.",
        "type": "problem",
        "category": "روشنایی و برق شهری",
        "lat": 34.6530,
        "lng": 50.8900,
        "region": "منطقه ۱ (شمال قم)",
        "status": "resolved",
        "likes": 11,
        "admin_response": "نورپردازی تعمیر و بهینه‌سازی شد.",
    },
    {
        "title": "آموزش تفکیک زباله از مبدأ",
        "description": "پیشنهاد اجرای کارگاه‌های آموزش تفکیک زباله در سرای محله‌های منطقه ۴ برای کاهش زباله‌های قابل بازیافت.",
        "type": "idea",
        "category": "مدیریت پسماند و بازیافت",
        "lat": 34.6580,
        "lng": 50.8550,
        "region": "منطقه ۴ (غرب قم)",
        "status": "submitted",
        "likes": 10,
        "admin_response": None,
    },
    {
        "title": "تعمیر نیمکت‌های بوستان غدیر",
        "description": "بسیاری از نیمکت‌های بوستان غدیر شکسته یا فرسوده شده و نیاز به تعمیر یا تعویض دارند.",
        "type": "problem",
        "category": "زیباسازی و فضای سبز",
        "lat": 34.6450,
        "lng": 50.8950,
        "region": "منطقه ۲ (مرکز قم)",
        "status": "in_progress",
        "likes": 6,
        "admin_response": "در حال تعویض نیمکت‌های فرسوده هستیم.",
    },
    {
        "title": "بازارچه محلی در منطقه ۳",
        "description": "ایجاد بازارچه محلی برای فروش محصولات کشاورز محلی در ضلع شرقی منطقه ۳ می‌تواند به رونق اقتصاد محلی کمک کند.",
        "type": "idea",
        "category": "سایر",
        "lat": 34.6400,
        "lng": 50.9600,
        "region": "منطقه ۳ (شرق قم)",
        "status": "submitted",
        "likes": 19,
        "admin_response": None,
    },
    {
        "title": "سرعت‌گیر غیراستاندارد در خیابان سمیه",
        "description": "سرعت‌گیرهای خیابان سمیه بسیار بلند و غیراستاندارد هستند و به خودروها آسیب می‌زنند.",
        "type": "problem",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6370,
        "lng": 50.8780,
        "region": "منطقه ۵ (جنوب قم)",
        "status": "submitted",
        "likes": 13,
        "admin_response": None,
    },
    {
        "title": "آلودگی صوتی اتوبوس‌های بی‌آرتی",
        "description": "اتوبوس‌های خط بی‌آرتی بلوار امین آلودگی صوتی شدیدی ایجاد می‌کنند. پیشنهاد استفاده از اتوبوس‌های برقی.",
        "type": "idea",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6520,
        "lng": 50.8830,
        "region": "منطقه ۱ (شمال قم)",
        "status": "under_review",
        "likes": 16,
        "admin_response": None,
    },
    {
        "title": "نقص آبنمای میدان جهاد",
        "description": "آبنمای میدان جهاد چند هفته است که از کار افتاده و ظاهر نازیبایی پیدا کرده است.",
        "type": "problem",
        "category": "زیباسازی و فضای سبز",
        "lat": 34.6560,
        "lng": 50.8860,
        "region": "منطقه ۱ (شمال قم)",
        "status": "archived",
        "likes": 2,
        "admin_response": "به دلیل تعمیرات اساسی تا اطلاع ثانوی غیرفعال است.",
    },
    {
        "title": "دوربین ثبت تخلف در بلوار جمهوری",
        "description": "چندین دوربین ثبت تخلف در بلوار جمهوری (شهرک پردیسان) خراب است و رانندگان متخلف بدون جریمه می‌مانند.",
        "type": "problem",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6700,
        "lng": 50.8700,
        "region": "منطقه ۱ (شمال قم)",
        "status": "submitted",
        "likes": 8,
        "admin_response": None,
    },
    {
        "title": "ایستگاه دوچرخه در منطقه ۳",
        "description": "پیشنهاد راه‌اندازی ایستگاه‌های دوچرخه اشتراکی در محدوده خیابان ساحلی شرق قم برای کاهش ترافیک.",
        "type": "idea",
        "category": "ترافیک و حمل و نقل",
        "lat": 34.6380,
        "lng": 50.9800,
        "region": "منطقه ۳ (شرق قم)",
        "status": "submitted",
        "likes": 11,
        "admin_response": None,
    },
    {
        "title": "تعمیر روشنایی پارک پردیسان",
        "description": "نیمی از چراغ‌های مسیر پیاده‌روی پارک پردیسان روشن نیست و استفاده از پارک در شب را خطرناک کرده است.",
        "type": "problem",
        "category": "روشنایی و برق شهری",
        "lat": 34.6730,
        "lng": 50.8750,
        "region": "منطقه ۱ (شمال قم)",
        "status": "in_progress",
        "likes": 7,
        "admin_response": "در حال تعویض چراغ‌های معیوب هستیم.",
    },
    {
        "title": "جداسازی مسیر دوچرخه از پیاده‌رو در بلوار غدیر",
        "description": "مسیر دوچرخه در بلوار غدیر با پیاده‌رو تداخل دارد. پیشنهاد جداسازی فیزیکی این دو مسیر.",
        "type": "idea",
        "category": "مناسب‌سازی و خدمات اجتماعی",
        "lat": 34.6540,
        "lng": 50.8920,
        "region": "منطقه ۱ (شمال قم)",
        "status": "submitted",
        "likes": 5,
        "admin_response": None,
    },
]


def seed():
    db = SessionLocal()

    existing_users = db.query(User).count()
    if existing_users == 0:
        admin_user = User(
            phone=ADMIN_PHONE,
            national_id=ADMIN_NATIONAL_ID,
            first_name="مدیر",
            last_name="سامانه",
            is_admin=True,
        )
        db.add(admin_user)
        for u in USERS:
            db.add(User(**u))
        db.commit()
        print(f"Seeded {len(USERS) + 1} users (1 admin + {len(USERS)} citizens)")
    else:
        print(f"Skipping users — {existing_users} already exist")

    existing_requests = db.query(Request).count()
    if existing_requests > 0:
        print(f"Skipping requests — {existing_requests} already exist")
        db.close()
        return

    base_time = datetime.now(timezone.utc) - timedelta(days=30)

    for i, r in enumerate(REQUESTS):
        user = random.choice(USERS)
        created = base_time + timedelta(
            days=random.randint(0, 28), hours=random.randint(0, 23), minutes=random.randint(0, 59)
        )

        from sqlalchemy import text

        db.execute(
            text("""
                INSERT INTO requests (id, title, description, type, category, lat, lng,
                    region, status, user_phone, user_name, created_at, admin_response, likes)
                VALUES (:id, :title, :description, :type, :category, :lat, :lng,
                    :region, :status, :user_phone, :user_name, :created_at, :admin_response, :likes)
            """),
            {
                "id": f"req_{uuid.uuid4().hex[:8]}",
                "title": r["title"],
                "description": r["description"],
                "type": r["type"],
                "category": r["category"],
                "lat": str(r["lat"]),
                "lng": str(r["lng"]),
                "region": r["region"],
                "status": r["status"],
                "user_phone": user["phone"],
                "user_name": f"{user['first_name']} {user['last_name']}",
                "created_at": created,
                "admin_response": r["admin_response"],
                "likes": r["likes"],
            },
        )

    db.commit()
    db.close()
    print(
        f"Seeded {len(REQUESTS)} requests across {len(CATEGORIES)} categories and {len(STATUSES)} statuses"
    )


if __name__ == "__main__":
    seed()
