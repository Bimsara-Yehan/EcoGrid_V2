const mongoose = require('mongoose');
const CommunityEvent = require('../models/CommunityEvent');

// Sample community cleaning events data
const communityEvents = [
    {
        title: "River Cleanup Drive - Kelani River",
        description: "Join us for a comprehensive river cleanup initiative along the Kelani River. Help remove plastic waste, debris, and pollutants to restore the natural beauty of our waterways. All equipment provided including boats, nets, and safety gear.",
        imageUrl: "/images/river.jpeg",
        eventDate: new Date('2024-02-15T08:00:00Z'),
        duration: "4 hours",
        location: {
            name: "Kelani River Bank",
            address: "Kelani River, Colombo District",
            coordinates: {
                latitude: 6.9271,
                longitude: 79.8612
            }
        },
        organizer: {
            name: "Sri Lanka Environmental Foundation",
            contact: {
                phone: "+94 11 234 5678",
                email: "info@slef.lk"
            }
        },
        maxParticipants: 100,
        currentParticipants: 45,
        status: "upcoming"
    },
    {
        title: "Beach Cleanup Campaign - Negombo Beach",
        description: "Participate in our beach cleanup campaign at Negombo Beach to combat plastic pollution. We'll focus on collecting plastic bottles, bags, and other marine debris. This event includes educational sessions about marine conservation.",
        imageUrl: "/images/beach.jpeg",
        eventDate: new Date('2024-02-20T07:00:00Z'),
        duration: "3 hours",
        location: {
            name: "Negombo Beach",
            address: "Negombo Beach, Negombo",
            coordinates: {
                latitude: 7.2086,
                longitude: 79.8358
            }
        },
        organizer: {
            name: "Marine Conservation Society",
            contact: {
                phone: "+94 31 223 4567",
                email: "marine@conservation.lk"
            }
        },
        maxParticipants: 80,
        currentParticipants: 32,
        status: "upcoming"
    },
    {
        title: "Street Cleaning Initiative - Kandy City Center",
        description: "Join our street cleaning initiative in Kandy city center. Help maintain clean streets and public spaces while promoting community awareness about waste management. Perfect for families and community groups.",
        imageUrl: "/images/street.jpeg",
        eventDate: new Date('2024-02-25T06:30:00Z'),
        duration: "2 hours",
        location: {
            name: "Kandy City Center",
            address: "Dalada Veediya, Kandy",
            coordinates: {
                latitude: 7.2906,
                longitude: 80.6337
            }
        },
        organizer: {
            name: "Kandy Municipal Council",
            contact: {
                phone: "+94 81 222 3456",
                email: "cleanup@kandy.lk"
            }
        },
        maxParticipants: 60,
        currentParticipants: 28,
        status: "upcoming"
    }
];

// Connect to MongoDB
const connectDB = async () => {
    try {
        const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
        
        await mongoose.connect(process.env.MONGODB_URI || DEFAULT_ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create community events
const createCommunityEvents = async () => {
    try {
        // Clear existing events
        await CommunityEvent.deleteMany({});
        console.log('Cleared existing community events');

        // Create new events
        const createdEvents = await CommunityEvent.insertMany(communityEvents);
        console.log(`Created ${createdEvents.length} community events`);

        // Display created events
        createdEvents.forEach((event, index) => {
            console.log(`${index + 1}. ${event.title}`);
            console.log(`   Date: ${event.eventDate.toLocaleDateString()}`);
            console.log(`   Location: ${event.location.name}`);
            console.log(`   Organizer: ${event.organizer.name}`);
            console.log(`   Participants: ${event.currentParticipants}/${event.maxParticipants}`);
            console.log('');
        });

        console.log('Community events setup completed successfully!');
    } catch (error) {
        console.error('Error creating community events:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await createCommunityEvents();
    await mongoose.connection.close();
    console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { communityEvents };
