// Mock data structure for testing layout and styling
// This mimics the structure the SDK expects from real API responses

export const mockTheaterData = [
  {
    name: "AMC COUNCIL BLUFFS 17",
    chain: "AMC",
    address: "2025 Kent Avenue, Council Bluffs, IA 51503",
    distance: 4,
    city: "Council Bluffs",
    formats: [
      {
        type: "IMAX 2D",
        category_name: "IMAX 2D",
        times: [
          { time: "10:30AM", category: "morning" },
          { time: "1:15PM", category: "afternoon" },
          { time: "4:00PM", category: "afternoon" },
          { time: "7:30PM", category: "evening" },
          { time: "10:30PM", category: "evening" }
        ]
      },
      {
        type: "AMC PRIME",
        category_name: "AMC PRIME",
        times: [
          { time: "11:00AM", category: "morning" },
          { time: "2:30PM", category: "afternoon" },
          { time: "6:15PM", category: "evening" },
          { time: "9:30PM", category: "evening" }
        ]
      },
      {
        type: "DOLBY ATMOS",
        category_name: "DOLBY ATMOS",
        times: [
          { time: "12:45PM", category: "afternoon" },
          { time: "3:45PM", category: "afternoon" },
          { time: "8:15PM", category: "evening" },
          { time: "11:00PM", category: "late_night" }
        ]
      }
    ]
  },
  {
    name: "ACX AKSARBEN CINEMA",
    chain: "ACX",
    address: "2110 South 67th Street, Omaha, NE 68106",
    distance: 11,
    city: "Omaha",
    formats: [
      {
        type: "2D",
        category_name: "2D",
        times: [
          { time: "10:45AM", category: "morning" },
          { time: "1:30PM", category: "afternoon" },
          { time: "4:15PM", category: "afternoon" },
          { time: "7:00PM", category: "evening" },
          { time: "9:45PM", category: "evening" }
        ]
      },
      {
        type: "DOLBY CINEMA",
        category_name: "DOLBY CINEMA",
        times: [
          { time: "11:30AM", category: "morning" },
          { time: "2:45PM", category: "afternoon" },
          { time: "6:30PM", category: "evening" },
          { time: "10:00PM", category: "evening" }
        ]
      }
    ]
  },
  {
    name: "MARCUS TWIN CREEK CINEMA",
    chain: "MARCUS",
    address: "1000 Sycamore Park, Bellevue, NE 68005",
    distance: 12,
    city: "Bellevue",
    formats: [
      {
        type: "2D",
        category_name: "2D",
        times: [
          { time: "10:00AM", category: "morning" },
          { time: "1:00PM", category: "afternoon" },
          { time: "4:30PM", category: "afternoon" },
          { time: "7:45PM", category: "evening" },
          { time: "10:35PM", category: "evening" }
        ]
      },
      {
        type: "ULTRASCREEN DLX",
        category_name: "ULTRASCREEN DLX",
        times: [
          { time: "11:15AM", category: "morning" },
          { time: "2:15PM", category: "afternoon" },
          { time: "5:45PM", category: "evening" },
          { time: "9:00PM", category: "evening" }
        ]
      }
    ]
  },
  {
    name: "AMC CLASSIC WESTROADS 14",
    chain: "AMC",
    address: "10000 California Street, Omaha, NE 68114",
    distance: 14,
    city: "Omaha",
    formats: [
      {
        type: "IMAX 2D",
        category_name: "IMAX 2D",
        times: [
          { time: "12:00PM", category: "afternoon" },
          { time: "3:30PM", category: "afternoon" },
          { time: "7:15PM", category: "evening" },
          { time: "10:45PM", category: "evening" }
        ]
      },
      {
        type: "2D",
        category_name: "2D",
        times: [
          { time: "10:15AM", category: "morning" },
          { time: "1:45PM", category: "afternoon" },
          { time: "5:00PM", category: "afternoon" },
          { time: "8:30PM", category: "evening" },
          { time: "11:15PM", category: "late_night" }
        ]
      }
    ]
  },
  {
    name: "B&B BELLEVUE CITY CINEMA 7",
    chain: "B&B",
    address: "1510 Galvin Road South, Bellevue, NE 68005",
    distance: 15,
    city: "Bellevue",
    formats: [
      {
        type: "2D",
        category_name: "2D",
        times: [
          { time: "11:45AM", category: "morning" },
          { time: "2:00PM", category: "afternoon" },
          { time: "5:15PM", category: "afternoon" },
          { time: "8:00PM", category: "evening" },
          { time: "10:30PM", category: "evening" }
        ]
      },
      {
        type: "4DX",
        category_name: "4DX",
        times: [
          { time: "1:15PM", category: "afternoon" },
          { time: "4:45PM", category: "afternoon" },
          { time: "7:30PM", category: "evening" },
          { time: "10:15PM", category: "evening" }
        ]
      }
    ]
  },
  {
    name: "REGAL VILLAGE POINTE",
    chain: "REGAL",
    address: "17305 Davenport Street, Omaha, NE 68118",
    distance: 18,
    city: "Omaha",
    formats: [
      {
        type: "RPX",
        category_name: "RPX",
        times: [
          { time: "11:00AM", category: "morning" },
          { time: "2:30PM", category: "afternoon" },
          { time: "6:00PM", category: "evening" },
          { time: "9:30PM", category: "evening" }
        ]
      },
      {
        type: "2D",
        category_name: "2D",
        times: [
          { time: "10:30AM", category: "morning" },
          { time: "1:15PM", category: "afternoon" },
          { time: "4:00PM", category: "afternoon" },
          { time: "7:15PM", category: "evening" },
          { time: "10:00PM", category: "evening" }
        ]
      }
    ]
  }
];

export const mockCategories = [
  { id: "1", name: "IMAX 2D" },
  { id: "2", name: "DOLBY CINEMA" },
  { id: "3", name: "DOLBY ATMOS" },
  { id: "4", name: "4DX" },
  { id: "5", name: "RPX" },
  { id: "6", name: "ULTRASCREEN DLX" },
  { id: "7", name: "AMC PRIME" },
  { id: "8", name: "2D" }
];

export const mockMovieConfig = {
  id: 'f1-movie-demo',
  movie_title: 'F1',
  movie_subtitle: 'THE MOVIE',
  description: 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt. Witness the high-octane world of Formula 1 racing like never before.',
  director: 'Joseph Kosinski',
  cast: ['Brad Pitt', 'Damson Idris', 'Kerry Condon', 'Tobias Menzies', 'Sarah Niles', 'Kim Bodnia'],
  rating: 'PG-13',
  runtime: '130 min',
  genre: ['Action', 'Drama', 'Sport'],
  film_details: {
    logline: 'A seasoned driver and a rookie teammate push the boundaries of racing excellence in the ultimate test of speed, skill, and determination.',
    synopsis: 'Against the backdrop of Formula 1\'s most challenging season, veteran driver Sonny Hayes (Brad Pitt) makes a comeback to partner with rookie Joshua Pearce (Damson Idris) on the APXGP team. As they navigate the high-stakes world of international racing, both drivers must confront their limits while competing against the sport\'s elite drivers in a season that will define their careers.',
    production_notes: 'Filmed during actual Formula 1 race weekends with unprecedented access to the sport. Real F1 cars were modified for filming, creating authentic racing sequences.',
    festival_selections: ['Cannes Film Festival - Out of Competition', 'Venice International Film Festival'],
    content_warnings: ['Intense racing sequences', 'Brief strong language'],
    languages: ['English'],
    subtitles: ['English', 'Spanish', 'French', 'German', 'Italian']
  },
  film_assets: {
    poster_image: '/uploads/f1-poster.jpg',
    backdrop_image: '/uploads/f1-backdrop.jpg',
    trailer_url: '/uploads/f1-trailer.mp4',
    badge_images: [
      '/uploads/now-playing-badge.png',
      '/uploads/imax-badge.png',
      '/uploads/theaters-only-badge.png'
    ],
    video_gallery: [
      '/uploads/f1-behind-scenes.mp4',
      '/uploads/f1-cast-interview.mp4'
    ]
  },
  social_links: {
    instagram: 'https://instagram.com/f1movie',
    twitter: 'https://twitter.com/f1movie',
    facebook: 'https://facebook.com/f1movie',
    tiktok: 'https://tiktok.com/@f1movie',
    website: 'https://f1movie.com'
  },
  primary_gradient: {
    type: 'linear',
    direction: '135deg',
    colors: ['#ef4444', '#dc2626', '#991b1b']
  },
  secondary_gradient: {
    type: 'radial',
    direction: 'circle at center',
    colors: ['#f97316', '#ea580c', '#c2410c']
  },
  background_color: '#0a0a0a',
  text_color: '#ffffff',
  accent_color: '#ef4444',
  typography: {
    title_font: 'Inter',
    body_font: 'Inter',
    title_weight: '800',
    body_weight: '400'
  }
};