import { YouTubeTrack } from '../types/music';

export interface PresetChip {
  id: string;
  name: string;
  icon: string;
  searchQuery: string;
  tagline: string;
  curatedTracks: YouTubeTrack[];
}

export const MUSIC_PRESET_CHIPS: PresetChip[] = [
  {
    id: 'diwali-songs',
    name: 'Diwali Songs',
    icon: '🪔',
    searchQuery: 'Diwali festive songs celebration',
    tagline: 'Classic celebration hits & fireworks vibes',
    curatedTracks: [
      {
        id: 'kXYiU_JCYtU', // Aayi Diwali Deep Jalao / Happy Diwali
        title: 'Happy Diwali Celebrations - Festive Beats',
        channelTitle: 'Festive India Records',
        thumbnailUrl: 'https://img.youtube.com/vi/kXYiU_JCYtU/hqdefault.jpg',
      },
      {
        id: 'V1l0Z4VvO6E',
        title: 'Diwali Aayi Re - Auspicious Deepavali Song',
        channelTitle: 'Bhakti Sagar & Festive',
        thumbnailUrl: 'https://img.youtube.com/vi/V1l0Z4VvO6E/hqdefault.jpg',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Bohemian Festive Diwali Dhun',
        channelTitle: 'Divine Strings',
        thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      },
    ],
  },
  {
    id: 'lakshmi-aarti',
    name: 'Lakshmi Aarti',
    icon: '🕉️',
    searchQuery: 'Om Jai Lakshmi Mata Aarti Diwali Puja',
    tagline: 'Sacred chants, Shri Suktam & Lakshmi puja',
    curatedTracks: [
      {
        id: 'xV1eL67K0bE', // Om Jai Lakshmi Mata Aarti
        title: 'Om Jai Lakshmi Mata - Full Aarti with Lyrics',
        channelTitle: 'T-Series Bhakti Sagar',
        thumbnailUrl: 'https://img.youtube.com/vi/xV1eL67K0bE/hqdefault.jpg',
      },
      {
        id: '2Vv-BfVoq4g', // Mahalakshmi Ashtakam
        title: 'Shri Mahalakshmi Ashtakam - Auspicious Puja Chants',
        channelTitle: 'Sanskrit Devotional',
        thumbnailUrl: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
      },
      {
        id: 'z9kO5qVvYp0',
        title: 'Shree Suktam & Kanakadhara Stotram',
        channelTitle: 'Vedic Chants',
        thumbnailUrl: 'https://img.youtube.com/vi/z9kO5qVvYp0/hqdefault.jpg',
      },
    ],
  },
  {
    id: 'bollywood-festive',
    name: 'Bollywood Festive',
    icon: '🎆',
    searchQuery: 'Bollywood Diwali party dance songs',
    tagline: 'High-energy Bollywood dance & celebration',
    curatedTracks: [
      {
        id: 'k4yXQkG2s1E', // Gallan Goodiyaan
        title: 'Gallan Goodiyaan - High Energy Celebration',
        channelTitle: 'T-Series',
        thumbnailUrl: 'https://img.youtube.com/vi/k4yXQkG2s1E/hqdefault.jpg',
      },
      {
        id: '4gC7bW8ZgZs', // Kala Chashma / Dhol
        title: 'Dhol & Festive Beats Celebration Mix',
        channelTitle: 'Bollywood Festive',
        thumbnailUrl: 'https://img.youtube.com/vi/4gC7bW8ZgZs/hqdefault.jpg',
      },
      {
        id: 'bo_efYhXY2g',
        title: 'London Thumakda - Wedding & Festival Dance',
        channelTitle: 'Zee Music Company',
        thumbnailUrl: 'https://img.youtube.com/vi/bo_efYhXY2g/hqdefault.jpg',
      },
    ],
  },
  {
    id: 'bengali-festive',
    name: 'Bengali Festive Songs',
    icon: '🌺',
    searchQuery: 'Bengali Kali Puja Shyama Sangeet festive songs',
    tagline: 'Joyful Agomoni, Shyama Sangeet & folk',
    curatedTracks: [
      {
        id: 'qB2kL0FwN_Y',
        title: 'Mayer Paaye Jaba Hoye - Shyama Sangeet',
        channelTitle: 'Saregama Bengali',
        thumbnailUrl: 'https://img.youtube.com/vi/qB2kL0FwN_Y/hqdefault.jpg',
      },
      {
        id: '3W1xK8vP9sM',
        title: 'Bolo Durga Mai Ki Jai - Bengali Festive Melodies',
        channelTitle: 'SVF Devotional',
        thumbnailUrl: 'https://img.youtube.com/vi/3W1xK8vP9sM/hqdefault.jpg',
      },
      {
        id: 'v4K9wR8z7mM',
        title: 'Joy Maa Tara & Kali Puja Traditional Bhajans',
        channelTitle: 'Asha Audio',
        thumbnailUrl: 'https://img.youtube.com/vi/v4K9wR8z7mM/hqdefault.jpg',
      },
    ],
  },
  {
    id: 'chill-instrumental',
    name: 'Chill Diwali Instrumental',
    icon: '🪕',
    searchQuery: 'Indian classical sitar flute bansuri chill ambient',
    tagline: 'Serene sitar, bansuri flute & relaxing ragas',
    curatedTracks: [
      {
        id: 'J5CqK6_W5hA',
        title: 'Peaceful Sitar & Bansuri Flute - Raag Yaman Meditative',
        channelTitle: 'Sitar Classical Serenity',
        thumbnailUrl: 'https://img.youtube.com/vi/J5CqK6_W5hA/hqdefault.jpg',
      },
      {
        id: '1e4vB90z0mM',
        title: 'Indian Lo-Fi Beats - Late Night Diya & Rangoli Chill',
        channelTitle: 'Desi Lo-Fi Hub',
        thumbnailUrl: 'https://img.youtube.com/vi/1e4vB90z0mM/hqdefault.jpg',
      },
      {
        id: 'p7K3zV8x1eQ',
        title: 'Santoor Cascades - Morning Diwali Peace',
        channelTitle: 'Classical India',
        thumbnailUrl: 'https://img.youtube.com/vi/p7K3zV8x1eQ/hqdefault.jpg',
      },
    ],
  },
];

// Auspicious starting track
export const DEFAULT_TRACK: YouTubeTrack = MUSIC_PRESET_CHIPS[0].curatedTracks[0];
