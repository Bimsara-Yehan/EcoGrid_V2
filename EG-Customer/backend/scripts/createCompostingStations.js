const mongoose = require('mongoose');
const CompostingStation = require('../models/CompostingStation');

// Kandy composting stations data
const compostingStations = [
    {
        name: "Kandy Central Composting Hub",
        description: "Main composting facility in Kandy city center, offering comprehensive organic waste processing and educational programs.",
        location: {
            address: "123 Peradeniya Road, Kandy 20000",
            coordinates: {
                latitude: 7.2906,
                longitude: 80.6337
            },
            area: "Kandy City"
        },
        capacity: 5000,
        currentLoad: 3200,
        operatingHours: {
            open: "06:00",
            close: "18:00",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        contact: {
            phone: "+94 81 222 3456",
            email: "kandycentral@compost.lk"
        },
        facilities: [
            "organic_waste_drop_off",
            "compost_pickup",
            "educational_workshops",
            "consultation_services",
            "waste_separation_guidance"
        ],
        status: "operational"
    },
    {
        name: "Peradeniya University Composting Center",
        description: "University-run composting facility serving the academic community and surrounding areas with research-based composting methods.",
        location: {
            address: "University of Peradeniya, Peradeniya 20400",
            coordinates: {
                latitude: 7.2544,
                longitude: 80.5981
            },
            area: "Peradeniya"
        },
        capacity: 3000,
        currentLoad: 1800,
        operatingHours: {
            open: "07:00",
            close: "17:00",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        contact: {
            phone: "+94 81 238 9000",
            email: "compost@pera.ac.lk"
        },
        facilities: [
            "organic_waste_drop_off",
            "compost_pickup",
            "educational_workshops",
            "equipment_rental",
            "consultation_services"
        ],
        status: "operational"
    },
    {
        name: "Katugastota Community Composting",
        description: "Community-driven composting station promoting sustainable waste management practices in residential areas.",
        location: {
            address: "45 Katugastota Road, Katugastota 20800",
            coordinates: {
                latitude: 7.28,
                longitude: 80.62
            },
            area: "Katugastota"
        },
        capacity: 2000,
        currentLoad: 1200,
        operatingHours: {
            open: "08:00",
            close: "16:00",
            days: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"]
        },
        contact: {
            phone: "+94 81 234 5678",
            email: "katugastota@compost.lk"
        },
        facilities: [
            "organic_waste_drop_off",
            "compost_pickup",
            "community_garden",
            "waste_separation_guidance"
        ],
        status: "operational"
    },
    {
        name: "Mahaiyawa Green Composting Station",
        description: "Eco-friendly composting facility with modern equipment and community education programs.",
        location: {
            address: "78 Mahaiyawa Road, Kandy 20000",
            coordinates: {
                latitude: 7.2756,
                longitude: 80.6456
            },
            area: "Mahaiyawa"
        },
        capacity: 4000,
        currentLoad: 2800,
        operatingHours: {
            open: "06:30",
            close: "17:30",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        contact: {
            phone: "+94 81 223 4567",
            email: "mahaiyawa@compost.lk"
        },
        facilities: [
            "organic_waste_drop_off",
            "compost_pickup",
            "educational_workshops",
            "equipment_rental",
            "consultation_services",
            "community_garden"
        ],
        status: "operational"
    },
    {
        name: "Kundasale Organic Waste Center",
        description: "Specialized composting facility for organic waste processing with focus on agricultural waste management.",
        location: {
            address: "12 Kundasale Road, Kundasale 20168",
            coordinates: {
                latitude: 7.2689,
                longitude: 80.6789
            },
            area: "Kundasale"
        },
        capacity: 3500,
        currentLoad: 2100,
        operatingHours: {
            open: "07:00",
            close: "16:00",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        contact: {
            phone: "+94 81 245 6789",
            email: "kundasale@compost.lk"
        },
        facilities: [
            "organic_waste_drop_off",
            "compost_pickup",
            "educational_workshops",
            "consultation_services",
            "waste_separation_guidance"
        ],
        status: "operational"
    }
];

// Connect to MongoDB
const connectDB = async () => {
    try {
        const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/ecogrid?retryWrites=true&w=majority&appName=Cluster0';
        
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

// Create composting stations
const createCompostingStations = async () => {
    try {
        // Update Katugastota station coordinates
        const katugastotaStation = compostingStations.find(station => station.name === "Katugastota Community Composting");
        let createdStations = [];
        
        if (katugastotaStation) {
            const updatedStation = await CompostingStation.findOneAndUpdate(
                { name: "Katugastota Community Composting" },
                { 
                    'location.coordinates.latitude': katugastotaStation.location.coordinates.latitude,
                    'location.coordinates.longitude': katugastotaStation.location.coordinates.longitude
                },
                { new: true }
            );
            
            if (updatedStation) {
                console.log('Updated Katugastota station coordinates');
                console.log(`New coordinates: ${updatedStation.location.coordinates.latitude}, ${updatedStation.location.coordinates.longitude}`);
                createdStations = [updatedStation];
            } else {
                console.log('Katugastota station not found, creating new stations...');
                // Create new stations if Katugastota doesn't exist
                createdStations = await CompostingStation.insertMany(compostingStations);
                console.log(`Created ${createdStations.length} composting stations in Kandy`);
            }
        }

        // Display created stations
        if (createdStations.length > 0) {
            createdStations.forEach((station, index) => {
                console.log(`${index + 1}. ${station.name} - ${station.location.area}`);
                console.log(`   Address: ${station.location.address}`);
                console.log(`   Coordinates: ${station.location.coordinates.latitude}, ${station.location.coordinates.longitude}`);
                console.log(`   Capacity: ${station.capacity} kg`);
                console.log(`   Hours: ${station.operatingHours.open} - ${station.operatingHours.close}`);
                console.log(`   Facilities: ${station.facilities.join(', ')}`);
                console.log('');
            });
        }

        console.log('Composting stations setup completed successfully!');
    } catch (error) {
        console.error('Error creating composting stations:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await createCompostingStations();
    await mongoose.connection.close();
    console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { compostingStations };











