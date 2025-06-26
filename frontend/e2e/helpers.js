export async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Email ID').fill('testing@gmail.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: 'Login' }).click();
  // Wait for redirect to a protected page
  await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/vitals' || url.pathname === '/summary');
} 