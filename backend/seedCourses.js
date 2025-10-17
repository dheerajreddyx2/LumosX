const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Sample courses data (general pool)
const sampleCourses = [
  {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript. Build your first website from scratch and understand modern web development practices.",
    duration: "8 weeks"
  },
  {
    title: "Data Structures and Algorithms",
    description: "Master essential data structures and algorithms. Learn problem-solving techniques and prepare for technical interviews with hands-on coding challenges.",
    duration: "10 weeks"
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Explore the world of machine learning. Learn about supervised and unsupervised learning, neural networks, and real-world AI applications.",
    duration: "12 weeks"
  },
  {
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native. Create iOS and Android apps with a single codebase.",
    duration: "6 weeks"
  },
  {
    title: "Database Design and SQL",
    description: "Master database design principles and SQL queries. Learn about normalization, indexing, and optimization techniques for efficient data management.",
    duration: "6 weeks"
  },
  {
    title: "Cloud Computing with AWS",
    description: "Learn cloud computing concepts using Amazon Web Services. Deploy scalable applications and understand cloud architecture patterns.",
    duration: "8 weeks"
  },
  {
    title: "Cybersecurity Essentials",
    description: "Understand security fundamentals, encryption, network security, and ethical hacking. Protect systems from modern cyber threats.",
    duration: "10 weeks"
  },
  {
    title: "UI/UX Design Principles",
    description: "Learn user interface and user experience design. Create intuitive, accessible, and beautiful digital products using design thinking.",
    duration: "8 weeks"
  },
  {
    title: "Python for Data Science",
    description: "Use Python for data analysis and visualization. Work with pandas, NumPy, and matplotlib to extract insights from data.",
    duration: "10 weeks"
  },
  {
    title: "DevOps and CI/CD",
    description: "Master DevOps practices and continuous integration/deployment. Learn Docker, Kubernetes, Jenkins, and automation tools.",
    duration: "8 weeks"
  },
  {
    title: "Blockchain and Cryptocurrency",
    description: "Understand blockchain technology and cryptocurrency fundamentals. Learn about smart contracts, DeFi, and Web3 development.",
    duration: "6 weeks"
  },
  {
    title: "Advanced JavaScript and TypeScript",
    description: "Deep dive into JavaScript and TypeScript. Learn advanced concepts, design patterns, and best practices for scalable applications.",
    duration: "10 weeks"
  },
  {
    title: "Digital Marketing Strategies",
    description: "Learn SEO, social media marketing, content strategy, and analytics. Drive growth through effective digital marketing campaigns.",
    duration: "6 weeks"
  },
  {
    title: "Game Development with Unity",
    description: "Create 2D and 3D games using Unity game engine. Learn game design, physics, animations, and C# programming.",
    duration: "12 weeks"
  },
  {
    title: "Business Analytics and Intelligence",
    description: "Transform data into actionable insights. Learn business intelligence tools, data visualization, and strategic decision-making.",
    duration: "8 weeks"
  }
];

// Additional curated courses tied to the named teachers with syllabus modules
const curatedCourses = [
  {
    title: "Full-Stack Web Development - Beginner to Pro",
    description: "A practical path from HTML/CSS fundamentals to building full-stack apps with Node.js and React.",
    duration: "12 weeks",
    syllabus: [
      { title: 'HTML & CSS Basics', content: 'Semantic HTML, layout, responsive design, Flexbox & Grid.' },
      { title: 'JavaScript Essentials', content: 'Core syntax, DOM, events, ES6+ features.' },
      { title: 'Frontend with React', content: 'Components, hooks, state management, routing.' },
      { title: 'Backend with Node & Express', content: 'APIs, routing, middleware, authentication.' },
      { title: 'Databases', content: 'MongoDB, schema design, Mongoose basics.' },
      { title: 'Deployment & DevOps Basics', content: 'Deploy apps, CI/CD, environment variables.' }
    ]
  },
  {
    title: "Data Science with Python",
    description: "Hands-on data analysis and visualization using Python, pandas, NumPy and Matplotlib.",
    duration: "10 weeks",
    syllabus: [
      { title: 'Python Refresher', content: 'Data types, control flow, functions, modules.' },
      { title: 'NumPy & Pandas', content: 'Array computing, dataframes, indexing, aggregation.' },
      { title: 'Data Visualization', content: 'Matplotlib, Seaborn, storytelling with charts.' },
      { title: 'Data Cleaning', content: 'Handling missing data, merging, reshaping.' },
      { title: 'Intro to ML', content: 'scikit-learn basics, supervised learning pipeline.' }
    ]
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Principles of user-centered design, prototyping and usability testing.",
    duration: "8 weeks",
    syllabus: [
      { title: 'Design Thinking', content: 'Empathize, define, ideate, prototype, test.' },
      { title: 'Visual Design Basics', content: 'Typography, color, spacing, visual hierarchy.' },
      { title: 'Wireframing & Prototyping', content: 'Low-fi to hi-fi designs, Figma basics.' },
      { title: 'Usability Testing', content: 'Setting goals, recruiting users, analysing results.' }
    ]
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Ensure the three requested teachers exist (create if missing)
    const bcrypt = require('bcryptjs');
    // Look up teachers by name (case-insensitive). If a name isn't found, create a teacher
    // with a generated example email and default password. This lets you keep your own
    // teacher accounts and have the seed attach courses to them by name.
    const teacherNames = [
      'p l anudeep',
      'rahul kandiboti',
      'affan khan'
    ];

    const teachers = {};
    for (const name of teacherNames) {
      // escape name for regex
      const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^${esc}$`, 'i');
      let found = await User.findOne({ name: re });
      if (!found) {
        console.log(`⚠️ Teacher named "${name}" not found. Creating a placeholder account...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('teacher123', salt);
        // generate an example email from the name
        const genEmail = name.split(/\s+/).join('.').toLowerCase() + '@example.com';
        found = await User.create({ name, email: genEmail, password: hashedPassword, role: 'teacher' });
        console.log(`✅ Created teacher placeholder: ${genEmail} / teacher123`);
      }
      teachers[name] = found;
    }

    console.log('📚 Teachers available for seeding:');
    Object.values(teachers).forEach(t => console.log(` - ${t.name} (${t.email})`));

    // Clear existing courses (optional - comment out if you want to keep existing)
    // await Course.deleteMany({});
    // console.log('🗑️ Cleared existing courses');

    // Add general sample courses (assign to first available teacher)
    const primaryTeacher = teachers['p l anudeep'];
    let addedCount = 0;
    for (const courseData of sampleCourses) {
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (!existingCourse) {
        await Course.create({ ...courseData, teacher: primaryTeacher._id, enrolledStudents: [] });
        addedCount++;
        console.log(`✅ Added: ${courseData.title}`);
      } else {
        console.log(`⏭️ Skipped (already exists): ${courseData.title}`);
      }
    }

    // Add curated courses and attach syllabi to different teachers
    for (const [idx, c] of curatedCourses.entries()) {
      const exists = await Course.findOne({ title: c.title });
      if (exists) {
        console.log(`⏭️ Skipped curated (already exists): ${c.title}`);
        continue;
      }
      // Assign teachers round-robin from the list
      const teacherList = Object.values(teachers);
      const assign = teacherList[idx % teacherList.length];
      const created = await Course.create({
        title: c.title,
        description: c.description,
        duration: c.duration,
        teacher: assign._id,
        enrolledStudents: [],
        modules: c.syllabus
      });
      addedCount++;
      console.log(`✅ Added curated course: ${c.title} (teacher: ${assign.name})`);
    }

    // Add a few random courses per teacher (3 each) with simple syllabi
    const perTeacherExtras = {
      'p l anudeep': [
        {
          title: 'React for Beginners - Anudeep Edition',
          description: 'Hands-on React course covering components, hooks, and simple state management.',
          duration: '6 weeks',
          modules: [
            { title: 'React Basics', content: 'JSX, components, props.' },
            { title: 'State & Props', content: 'useState, passing data.' },
            { title: 'Effects & Data', content: 'useEffect, fetching data.' },
            { title: 'Project', content: 'Build a small SPA.' }
          ]
        },
        {
          title: 'Node.js API Development - Anudeep',
          description: 'Build RESTful APIs using Node.js and Express with best practices.',
          duration: '5 weeks',
          modules: [
            { title: 'Node Intro', content: 'Runtime and modules.' },
            { title: 'Express Basics', content: 'Routing and middleware.' },
            { title: 'Databases', content: 'Connect to MongoDB.' },
            { title: 'Auth & Testing', content: 'JWT and basic tests.' }
          ]
        },
        {
          title: 'Frontend Performance Optimization',
          description: 'Techniques to optimize frontend performance and load times.',
          duration: '4 weeks',
          modules: [
            { title: 'Measuring Perf', content: 'Lighthouse, metrics.' },
            { title: 'Optimization', content: 'Code splitting, lazy loading.' },
            { title: 'Images & Assets', content: 'Responsive images, compression.' },
            { title: 'Monitoring', content: 'RUM and error tracking.' }
          ]
        }
      ],
      'rahul kandiboti': [
        {
          title: 'Intro to Cybersecurity - Rahul',
          description: 'Learn security fundamentals, threat models and basic defensive controls.',
          duration: '6 weeks',
          modules: [
            { title: 'Threat Models', content: 'Understanding attackers.' },
            { title: 'Network Security', content: 'Firewalls, segmentation.' },
            { title: 'Encryption', content: 'TLS, basic cryptography.' },
            { title: 'Practical Labs', content: 'Hands-on exercises.' }
          ]
        },
        {
          title: 'Linux for Developers - Rahul',
          description: 'Practical Linux usage for developers and devops workflows.',
          duration: '4 weeks',
          modules: [
            { title: 'Shell & Tools', content: 'Bash, grep, awk, sed.' },
            { title: 'Process & System', content: 'ps, top, systemctl.' },
            { title: 'Scripting', content: 'Automating tasks.' },
            { title: 'Networking', content: 'SSH, networking basics.' }
          ]
        },
        {
          title: 'Database Internals - Rahul',
          description: 'Overview of how databases work under the hood.',
          duration: '6 weeks',
          modules: [
            { title: 'Storage Engines', content: 'How data is stored.' },
            { title: 'Indexing', content: 'B-trees, hash indexes.' },
            { title: 'Query Planning', content: 'Optimizers and execution.' },
            { title: 'Scaling', content: 'Sharding, replication.' }
          ]
        }
      ],
      'affan khan': [
        {
          title: 'Intro to Machine Learning - Affan',
          description: 'Basic ML concepts, supervised learning, and workflows.',
          duration: '8 weeks',
          modules: [
            { title: 'ML Basics', content: 'Datasets and models.' },
            { title: 'Supervised Learning', content: 'Regression & classification.' },
            { title: 'Model Evaluation', content: 'Metrics and cross-validation.' },
            { title: 'Deployment', content: 'Serving models.' }
          ]
        },
        {
          title: 'Data Visualization with Python - Affan',
          description: 'Create compelling visualizations using Matplotlib and Seaborn.',
          duration: '4 weeks',
          modules: [
            { title: 'Plot Types', content: 'Line, bar, scatter.' },
            { title: 'Styling', content: 'Themes and colors.' },
            { title: 'Advanced Charts', content: 'Heatmaps, pairplots.' },
            { title: 'Storytelling', content: 'Narrative with data.' }
          ]
        },
        {
          title: 'Applied Statistics for Engineers',
          description: 'Probability and statistics fundamentals for practical engineering use.',
          duration: '6 weeks',
          modules: [
            { title: 'Probability', content: 'Distributions and expectations.' },
            { title: 'Hypothesis Testing', content: 't-tests, chi-square.' },
            { title: 'Regression', content: 'Linear models.' },
            { title: 'Design of Experiments', content: 'A/B testing basics.' }
          ]
        }
      ]
    };

    for (const [teacherName, courses] of Object.entries(perTeacherExtras)) {
      const teacher = teachers[teacherName];
      if (!teacher) continue;
      for (const c of courses) {
        const found = await Course.findOne({ title: c.title });
        if (found) {
          console.log(`⏭️ Skipping (exists): ${c.title}`);
          continue;
        }
        await Course.create({
          title: c.title,
          description: c.description,
          duration: c.duration,
          teacher: teacher._id,
          enrolledStudents: [],
          modules: c.modules
        });
        addedCount++;
        console.log(`✅ Added for ${teacherName}: ${c.title}`);
      }
    }

    console.log(`\n🎉 Successfully added ${addedCount} new courses!`);
    console.log(`📊 Total courses in database: ${await Course.countDocuments()}`);
    
    // Add small fake ratings for courses that have none so UI doesn't show 0/0 everywhere
    const allCourses = await Course.find();
    for (const c of allCourses) {
      if (!c.ratings || c.ratings.length === 0) {
        // add 1-3 fake ratings with random 3-5 stars
        const fakeCount = Math.floor(Math.random() * 3) + 1; // 1..3
        for (let i = 0; i < fakeCount; i++) {
          c.ratings.push({
            user: null,
            stars: Math.floor(Math.random() * 3) + 3,
            review: ''
          });
        }
        await c.save();
        console.log(`🔖 Added ${fakeCount} fake ratings to: ${c.title}`);
      }
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCourses();

