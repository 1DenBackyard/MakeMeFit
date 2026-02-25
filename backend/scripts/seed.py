"""Seed database with initial data."""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.database import Base
from app.models import Trainer, Exercise, Supplement
from app.config import settings


async def seed():
    """Seed database."""
    engine = create_async_engine(settings.database_url, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as session:
        # Seed trainers
        trainers = [
            Trainer(
                telegram_username="trainer_john",
                name="John Smith",
                specialization="Strength training and bodybuilding",
                activity_types=["strength training", "bodybuilding", "powerlifting"],
                tags=["beginner-friendly", "advanced", "nutrition"],
                location="New York, USA",
                is_online=True,
                is_active=True,
            ),
            Trainer(
                telegram_username="trainer_sarah",
                name="Sarah Johnson",
                specialization="Yoga and flexibility",
                activity_types=["yoga", "pilates", "stretching"],
                tags=["beginner-friendly", "rehabilitation", "mindfulness"],
                location="Los Angeles, USA",
                is_online=True,
                is_active=True,
            ),
            Trainer(
                telegram_username="trainer_mike",
                name="Mike Chen",
                specialization="HIIT and cardio",
                activity_types=["HIIT", "cardio", "cross-training"],
                tags=["weight-loss", "endurance", "high-intensity"],
                location="Online",
                is_online=True,
                is_active=True,
            ),
        ]
        
        for trainer in trainers:
            session.add(trainer)
        
        # Seed exercises
        exercises = [
            Exercise(
                name="Push-ups",
                description="Classic bodyweight exercise for chest, shoulders, and triceps",
                muscle_groups=["chest", "shoulders", "triceps"],
                equipment="None",
                difficulty="beginner",
            ),
            Exercise(
                name="Squats",
                description="Fundamental lower body exercise",
                muscle_groups=["quadriceps", "glutes", "hamstrings"],
                equipment="None",
                difficulty="beginner",
            ),
            Exercise(
                name="Deadlifts",
                description="Compound exercise for posterior chain",
                muscle_groups=["hamstrings", "glutes", "back"],
                equipment="Barbell",
                difficulty="advanced",
            ),
        ]
        
        for exercise in exercises:
            session.add(exercise)
        
        # Seed supplements
        supplements = [
            Supplement(
                name="Whey Protein",
                description="Fast-digesting protein for muscle recovery",
                category="Protein",
                benefits=["muscle recovery", "protein synthesis", "convenience"],
                dosage_range="20-40g post-workout",
            ),
            Supplement(
                name="Creatine Monohydrate",
                description="Improves strength and power output",
                category="Performance",
                benefits=["strength", "power", "muscle mass"],
                dosage_range="3-5g daily",
            ),
            Supplement(
                name="Vitamin D3",
                description="Essential vitamin for bone health and immune function",
                category="Vitamins",
                benefits=["bone health", "immune function", "mood"],
                dosage_range="1000-4000 IU daily",
            ),
        ]
        
        for supplement in supplements:
            session.add(supplement)
        
        await session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
