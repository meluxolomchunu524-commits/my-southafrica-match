/**
 * Seed 20 dummy South African profiles for browsing.
 * Run: node scripts/seed-profiles.mjs
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const profiles = [
  { name: 'Amahle Dlamini',   username: 'amahle_d',   gender: 'Woman', dob: '1997-03-14', province: 'KwaZulu-Natal',  city: 'Durban',       bio: 'Beach lover, foodie and amateur photographer. Looking for someone to explore the coast with.', interests: ['Beach','Photography','Cooking','Travel'], relationship: 'Long-term relationship' },
  { name: 'Sipho Nkosi',      username: 'sipho_nk',   gender: 'Man',   dob: '1993-07-22', province: 'Gauteng',        city: 'Johannesburg', bio: 'Software engineer by day, jazz guitarist by night. I believe good conversation is the best first date.', interests: ['Jazz','Guitar','Tech','Coffee'], relationship: 'Long-term relationship' },
  { name: 'Lerato Molefe',    username: 'lerato_m',   gender: 'Woman', dob: '1999-11-05', province: 'Gauteng',        city: 'Pretoria',     bio: 'Yoga instructor and plant mum. My house has more greenery than a jungle.', interests: ['Yoga','Plants','Meditation','Hiking'], relationship: 'New friends' },
  { name: 'Thabo Sithole',    username: 'thabo_s',    gender: 'Man',   dob: '1990-01-30', province: 'Western Cape',   city: 'Cape Town',    bio: 'Architect who appreciates design in all forms. Big fan of Table Mountain hikes and craft beer.', interests: ['Architecture','Hiking','Craft Beer','Design'], relationship: 'Casual dating' },
  { name: 'Zanele Khumalo',   username: 'zanele_k',   gender: 'Woman', dob: '1995-08-19', province: 'Western Cape',   city: 'Cape Town',    bio: 'Winemaker at a Stellenbosch estate. I can pair a wine with any mood.', interests: ['Wine tasting','Cooking','Travel','Art'], relationship: 'Long-term relationship' },
  { name: 'Kagiso Mokoena',   username: 'kagiso_mo',  gender: 'Man',   dob: '1992-05-11', province: 'Gauteng',        city: 'Soweto',       bio: 'High school teacher and weekend footballer. Passionate about education and making a difference.', interests: ['Rugby','Football','Reading','Volunteering'], relationship: 'Marriage' },
  { name: 'Nomvula Zulu',     username: 'nomvula_z',  gender: 'Woman', dob: '1998-02-28', province: 'KwaZulu-Natal',  city: 'Pietermaritzburg', bio: 'Aspiring chef with a thing for Durban curries. Will cook for the right person.', interests: ['Cooking','Braai','Movies','Music'], relationship: 'Long-term relationship' },
  { name: 'Bongani Mthembu',  username: 'bongani_m',  gender: 'Man',   dob: '1988-09-03', province: 'Mpumalanga',    city: 'Nelspruit',    bio: 'Safari guide and wildlife enthusiast. The bush is my happy place — come join me.', interests: ['Wildlife','Hiking','Photography','Travel'], relationship: 'Still figuring it out' },
  { name: 'Precious Mahlangu',username: 'precious_ma',gender: 'Woman', dob: '1996-06-17', province: 'Limpopo',        city: 'Polokwane',    bio: 'Nurse by profession, dancer at heart. I believe laughter is the best medicine.', interests: ['Dancing','Afrobeats','Volunteering','Movies'], relationship: 'Long-term relationship' },
  { name: 'Luthando Petersen',username: 'luthando_p', gender: 'Man',   dob: '1994-12-09', province: 'Western Cape',   city: 'George',       bio: 'Surfer and environmental activist. I will always choose the ocean.', interests: ['Surfing','Environment','Hiking','Coffee'], relationship: 'Casual dating' },
  { name: 'Ayanda Ngcobo',    username: 'ayanda_ng',  gender: 'Woman', dob: '2000-04-25', province: 'KwaZulu-Natal',  city: 'Durban',       bio: 'Fashion design student obsessed with Afrocentric prints and street style.', interests: ['Fashion','Art','Travel','Dancing'], relationship: 'New friends' },
  { name: 'Mpho Ramaphosa',   username: 'mpho_r',     gender: 'Man',   dob: '1991-10-14', province: 'North West',     city: 'Rustenburg',   bio: 'Mining engineer who unwinds through braai and watching the Springboks.', interests: ['Rugby','Braai','Cricket','Hiking'], relationship: 'Long-term relationship' },
  { name: 'Sifiso Hadebe',    username: 'sifiso_h',   gender: 'Man',   dob: '1997-07-07', province: 'Gauteng',        city: 'Sandton',      bio: 'Investment banker who loves exploring Joburg\'s food scene on weekends.', interests: ['Food','Travel','Art','Coffee'], relationship: 'Still figuring it out' },
  { name: 'Kefilwe Moroka',   username: 'kefilwe_m',  gender: 'Woman', dob: '1993-03-21', province: 'Free State',     city: 'Bloemfontein', bio: 'Lecturer in African literature. If you love books, we will get along just fine.', interests: ['Reading','Writing','Jazz','Coffee'], relationship: 'Long-term relationship' },
  { name: 'Andile Cele',      username: 'andile_c',   gender: 'Man',   dob: '1989-11-02', province: 'KwaZulu-Natal',  city: 'Richards Bay', bio: 'Fisherman and amateur cook. The freshest seafood always ends up on my braai.', interests: ['Fishing','Cooking','Braai','Rugby'], relationship: 'Marriage' },
  { name: 'Tshego Modise',    username: 'tshego_mo',  gender: 'Woman', dob: '2001-09-16', province: 'Gauteng',        city: 'Midrand',      bio: 'Content creator & social media manager. Dog mom to three golden retrievers.', interests: ['Content Creation','Dogs','Travel','Coffee'], relationship: 'Casual dating' },
  { name: 'Lwazi Mthethwa',   username: 'lwazi_mt',   gender: 'Man',   dob: '1995-01-08', province: 'Eastern Cape',   city: 'East London',  bio: 'Mechanical engineer and beach volleyball player. Looking for a partner in adventure.', interests: ['Volleyball','Beach','Gym','Movies'], relationship: 'Long-term relationship' },
  { name: 'Palesa Mofokeng',  username: 'palesa_mo',  gender: 'Woman', dob: '1990-06-30', province: 'Gauteng',        city: 'Johannesburg', bio: 'Marketing director, single mum, and fierce advocate for self-love.', interests: ['Running','Reading','Wine tasting','Yoga'], relationship: 'Long-term relationship' },
  { name: 'Sello Ntuli',      username: 'sello_nt',   gender: 'Man',   dob: '1996-04-04', province: 'Northern Cape',  city: 'Kimberley',    bio: 'Geologist who moonlights as a stand-up comedian. Life is too short to be serious.', interests: ['Comedy','Travel','Gaming','Braai'], relationship: 'Still figuring it out' },
  { name: 'Dineo Mashaba',    username: 'dineo_ma',   gender: 'Woman', dob: '1998-08-11', province: 'Limpopo',        city: 'Tzaneen',      bio: 'Agricultural scientist with a passion for sustainable farming. I grow my own vegetables.', interests: ['Gardening','Cooking','Hiking','Animals'], relationship: 'Long-term relationship' },
];

const PASSWORD_HASH = await bcrypt.hash('Dummy1234!', 12);

let created = 0;
let skipped = 0;

for (const p of profiles) {
  const email = `${p.username}@loveconnect-dummy.sa`;
  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length > 0) { skipped++; continue; }
  const id = randomUUID();
  await pool.query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3)',
    [id, email, PASSWORD_HASH],
  );
  await pool.query(
    `INSERT INTO profiles
       (id, email, full_name, username, gender, date_of_birth, province, city,
        bio, interests, relationship_preference, photos, avatar_url)
     VALUES ($1,$2,$3,$4,$5,$6::date,$7,$8,$9,$10,$11,$12,$13)`,
    [
      id, email, p.name, p.username, p.gender, p.dob,
      p.province, p.city, p.bio, p.interests,
      p.relationship, [], null,
    ],
  );
  created++;
  console.log(`  ✓ ${p.name} (${p.city})`);
}

await pool.end();
console.log(`\nDone — ${created} created, ${skipped} already existed.`);
