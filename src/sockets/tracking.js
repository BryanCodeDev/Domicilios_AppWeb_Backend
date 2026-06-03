const initSocket = (io) => {
  const trackingNamespace = io.of('/tracking');

  trackingNamespace.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const userRole = socket.handshake.query.userRole;

    if (!userId || !userRole) {
      socket.disconnect(true);
      return;
    }

    console.log(`Socket connected: ${socket.id} - User: ${userId} - Role: ${userRole}`);

    socket.on('join_order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order:${orderId}`);
    });

    socket.on('join_business', (businessId) => {
      socket.join(`business:${businessId}`);
      console.log(`Socket ${socket.id} joined business:${businessId}`);
    });

    socket.on('join_rider', (riderId) => {
      socket.join(`rider:${riderId}`);
      console.log(`Socket ${socket.id} joined rider:${riderId}`);
    });

    socket.on('rider_location', (data) => {
      if (userRole !== 'repartidor') return;
      const { orderId, lat, lng } = data;
      trackingNamespace.to(`order:${orderId}`).emit('rider_location_updated', { orderId, lat, lng });
    });

    socket.on('order_status_change', (data) => {
      const { orderId, estado, businessId } = data;
      trackingNamespace.to(`order:${orderId}`).emit('order_update', { orderId, estado });
      if (businessId) {
        trackingNamespace.to(`business:${businessId}`).emit('order_update', { orderId, estado });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  return trackingNamespace;
};

module.exports = { initSocket };