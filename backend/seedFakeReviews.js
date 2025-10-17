const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const Course = require('./models/Course');
const User = require('./models/User');

// Fake review data
const fakeReviews = [
  {
    stars: 5,
    review: "Excellent course! The instructor explains everything clearly and the materials are well-organized. Highly recommended for beginners."
  },
  {
    stars: 4,
    review: "Great course with practical examples. The assignments were challenging but helped me understand the concepts better."
  },
  {
    stars: 5,
    review: "Amazing learning experience! The instructor is very knowledgeable and responsive to questions. Worth every penny!"
  },
  {
    stars: 4,
    review: "Good course overall. Some topics could be explained in more detail, but the practical exercises make up for it."
  },
  {
    stars: 5,
    review: "Perfect for my learning style. The step-by-step approach and real-world examples made complex topics easy to understand."
  },
  {
    stars: 3,
    review: "Decent course but could use more interactive content. The theory is good but needs more hands-on practice."
  },
  {
    stars: 4,
    review: "Well-structured course with good pacing. The instructor provides helpful feedback and the community is supportive."
  },
  {
    stars: 5,
    review: "Outstanding course! The instructor's teaching style is engaging and the course materials are top-notch. Learned a lot!"
  },
  {
    stars: 4,
    review: "Good course with comprehensive coverage of the topic. The quizzes help reinforce learning and the instructor is helpful."
  },
  {
    stars: 5,
    review: "Fantastic course! The instructor breaks down complex concepts into digestible pieces. The practical projects are excellent."
  },
  {
    stars: 3,
    review: "Average course. Some modules are better than others. Could benefit from more visual aids and examples."
  },
  {
    stars: 4,
    review: "Solid course with good content. The instructor is knowledgeable and the course structure is logical and easy to follow."
  },
  {
    stars: 5,
    review: "Exceptional course! The instructor's expertise shines through and the course is well-designed for all skill levels."
  },
  {
    stars: 4,
    review: "Very good course. The materials are comprehensive and the instructor provides clear explanations. Recommended!"
  },
  {
    stars: 5,
    review: "Outstanding learning experience! The course exceeded my expectations and I gained valuable skills. Thank you!"
  }
];

const fakeStudentNames = [
  "Alex Johnson", "Sarah Chen", "Michael Rodriguez", "Emily Davis", "David Kim",
  "Jessica Wang", "Ryan Thompson", "Lisa Anderson", "James Wilson", "Maria Garcia",
  "Kevin Brown", "Amanda Taylor", "Chris Lee", "Rachel Green", "Daniel Martinez",
  "Sophie White", "Tom Jackson", "Emma Clark", "Nick Adams", "Olivia Turner"
];

async function seedFakeReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all courses
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses`);

    // Get all users (we'll use them as fake reviewers)
    const users = await User.find({ role: 'student' });
    console.log(`Found ${users.length} students`);

    if (users.length === 0) {
      console.log('No students found. Creating fake student users...');
      
      // Create fake student users if none exist
      for (let i = 0; i < 20; i++) {
        const fakeUser = new User({
          name: fakeStudentNames[i],
          email: `student${i + 1}@example.com`,
          password: 'hashedpassword', // This won't be used for login
          role: 'student'
        });
        await fakeUser.save();
      }
      
      // Fetch the newly created users
      const newUsers = await User.find({ role: 'student' });
      users.push(...newUsers);
    }

    // Add fake reviews to each course
    for (const course of courses) {
      console.log(`Adding reviews to course: ${course.title}`);
      
      // Clear existing reviews
      course.ratings = [];
      
      // Add 3-8 random reviews per course
      const numReviews = Math.floor(Math.random() * 6) + 3; // 3-8 reviews
      
      for (let i = 0; i < numReviews; i++) {
        const randomReview = fakeReviews[Math.floor(Math.random() * fakeReviews.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        // Check if this user already reviewed this course
        const existingReview = course.ratings.find(rating => 
          rating.user.toString() === randomUser._id.toString()
        );
        
        if (!existingReview) {
          course.ratings.push({
            user: randomUser._id,
            stars: randomReview.stars,
            review: randomReview.review,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          });
        }
      }
      
      await course.save();
      console.log(`Added ${course.ratings.length} reviews to ${course.title}`);
    }

    console.log('Fake reviews seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding fake reviews:', error);
    process.exit(1);
  }
}

seedFakeReviews();

