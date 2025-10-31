import sharp from 'sharp';

sharp('public/icon-512.png')
  .resize(192, 192)
  .toFile('public/icon-192.png')
  .then(() => console.log('✓ Icon 192x192 created'))
  .catch(err => console.error('Error:', err));
