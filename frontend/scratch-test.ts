import apiClient from './src/lib/api/client';
import { getProjects } from './src/lib/api/projects';

async function test() {
  try {
    console.log("Calling getProjects...");
    await getProjects({ personal: 'true' });
    console.log("Success!");
  } catch (err) {
    console.error("Caught error:", err);
  }
}
test();
