const useGreeting = () => {
  // time of the day
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Good Morning' : timeOfDay < 18 ? 'Good Afternoon' : 'Good Evening';

  // date to local user browser settings
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return { date, greeting };
};

export default useGreeting;
