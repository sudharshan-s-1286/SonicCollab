import archiver from 'archiver';
import axios from 'axios';

/**
 * Builds a ZIP stream from an array of track objects
 * @param {Array} tracks - Array of track documents
 * @returns {Archiver} - The archiver instance (readable stream)
 */
export const buildZip = async (tracks) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level
  });

  for (const track of tracks) {
    try {
      const response = await axios({
        method: 'get',
        url: track.audioUrl,
        responseType: 'stream',
      });

      const fileName = `${track.stemType}_${track.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      archive.append(response.data, { name: fileName });
    } catch (error) {
      console.error(`Error fetching track ${track._id} for ZIP:`, error.message);
      // Continue with other tracks if one fails
    }
  }

  archive.finalize();
  return archive;
};
