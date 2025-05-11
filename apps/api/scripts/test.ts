import axios from 'axios';

async function main() {
  const url = 'https://google-map-places.p.rapidapi.com/maps/api/geocode/json';

  const { data } = await axios.get('');
}

main()
  .then()
  .catch((err) => console.log({ err }));
