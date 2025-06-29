import React, { useState } from 'react';
import './App.css';
import { Header, HeroSection, SearchFilter, TheaterListings, Footer } from './components';

// Mock theater data
const mockTheaters = [
  {
    name: "AMC COUNCIL BLUFFS 17",
    chain: "AMC",
    address: "2025 KENT AVENUE, COUNCIL BLUFFS, IA, 51503",
    distance: 4,
    formats: [
      { type: "IMAX 2D", times: ["10:30PM"] },
      { type: "AMC PRIME", times: ["9:30PM"] }
    ]
  },
  {
    name: "ACX AKSARBEN CINEMA",
    chain: "ACX",
    address: "2110 SOUTH 67TH STREET, OMAHA, NE, 68106",
    distance: 11,
    formats: [
      { type: "2D", times: ["9:15PM"] },
      { type: "DOLBY", times: ["10:00PM"] }
    ]
  },
  {
    name: "MARCUS TWIN CREEK CINEMA",
    chain: "MARCUS",
    address: "1000 SYCAMORE PARK BELLEVUE, NE, 68005",
    distance: 12,
    formats: [
      { type: "2D", times: ["9:30PM", "10:35PM"] }
    ]
  },
  {
    name: "AMC CLASSIC WESTROADS 14",
    chain: "AMC",
    address: "10000 CALIFORNIA STREET, OMAHA, NE, 68114",
    distance: 14,
    formats: [
      { type: "IMAX 2D", times: ["9:30PM"] }
    ]
  },
  {
    name: "ALAMO DRAFTHOUSE CINEMA - LA VISTA",
    chain: "ALAMO",
    address: "12100 WESTPORT PARKWAY, LA VISTA, NE, 68128",
    distance: 16,
    formats: [
      { type: "2D", times: ["9:30PM"] },
      { type: "DOLBY", times: ["10:15PM"] }
    ]
  },
  {
    name: "B & B OMAHA OAKVIEW PLAZA 14",
    chain: "B&B",
    address: "3005 SOUTH 144TH PLAZA, OMAHA, NE, 68144",
    distance: 18,
    formats: [
      { type: "2D", times: ["9:30PM", "9:45PM"] },
      { type: "SCREENX", times: ["10:30PM"] }
    ]
  },
  {
    name: "MARCUS MAJESTIC CINEMA OF OMAHA",
    chain: "MARCUS",
    address: "16021 MAPLE SQUARE, OMAHA, NE, 68116",
    distance: 18,
    formats: [
      { type: "2D", times: ["9:10PM", "10:30PM"] }
    ]
  },
  {
    name: "MARCUS VILLAGE POINTE CINEMA",
    chain: "MARCUS",
    address: "301 N. 171ST STREET, OMAHA, NE, 68118",
    distance: 21,
    formats: [
      { type: "2D", times: ["9:30PM", "10:30PM"] }
    ]
  },
  {
    name: "ACX CINEMA 12+",
    chain: "ACX",
    address: "2800 SOUTH 125TH PLAZA, OMAHA, NE, 68005",
    distance: 25,
    formats: [
      { type: "2D", times: ["9:30PM", "10:20PM"] },
      { type: "DOLBY", times: ["10:00PM"] }
    ]
  },
  {
    name: "FREMONT THEATERS",
    chain: "FREMONT",
    address: "449 NORTH 2700 STREET, FREMONT, NE, 68025",
    distance: 43,
    formats: [
      { type: "2D", times: ["9:40PM"] }
    ]
  },
  {
    name: "MARCUS EAST PARK CINEMA",
    chain: "MARCUS",
    address: "225 N. 66TH ST, LINCOLN, NE, 68510",
    distance: 62,
    formats: [
      { type: "DOLBY", times: ["10:10PM"] }
    ]
  },
  {
    name: "MARCUS LINCOLN GRAND CINEMA",
    chain: "MARCUS",
    address: "1203 P STREET, LINCOLN, NE, 68508",
    distance: 65,
    formats: [
      { type: "2D", times: ["9:10PM", "10:30PM"] }
    ]
  }
];

function App() {
  const [selectedLocation, setSelectedLocation] = useState("COUNCIL BLUFFS, IA");
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedDay, setSelectedDay] = useState({ day: 'SAT', date: 'JUN', num: '28' });
  const [selectedTime, setSelectedTime] = useState('EVENING');
  const [selectedTheater, setSelectedTheater] = useState(null);

  const handleSelectTheater = (theater) => {
    setSelectedTheater(theater);
    // Here you would typically navigate to a seat selection page
    alert(`Selected ${theater.name}. Proceeding to seat selection...`);
  };

  // Filter theaters based on selected formats
  const filteredTheaters = mockTheaters.filter(theater => {
    if (selectedFormats.length === 0) return true;
    return theater.formats.some(format => 
      selectedFormats.includes(format.type)
    );
  });

  return (
    <div className="App">
      <Header />
      <HeroSection />
      <SearchFilter 
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedFormats={selectedFormats}
        setSelectedFormats={setSelectedFormats}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
      />
      <TheaterListings 
        theaters={filteredTheaters}
        onSelectTheater={handleSelectTheater}
      />
      <Footer />
    </div>
  );
}

export default App;