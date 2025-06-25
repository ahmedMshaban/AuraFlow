const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'overdue':
      return 'red';
    case 'pending':
      return 'blue';
    default:
      return 'gray';
  }
};

export default getStatusColor;
