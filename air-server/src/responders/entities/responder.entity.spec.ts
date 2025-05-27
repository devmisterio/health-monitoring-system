import { Responder } from './responder.entity';

describe('Responder Health Logic', () => {
  it('should be healthy when active and recently seen', () => {
    const responder = new Responder();
    responder.isActive = true;
    responder.lastSeen = new Date(Date.now() - 30000); // 30 seconds ago
    
    expect(responder.isHealthy).toBe(true);
    expect(responder.status).toBe('healthy');
  });

  it('should be offline when last seen over 60 seconds ago', () => {
    const responder = new Responder();
    responder.isActive = true;
    responder.lastSeen = new Date(Date.now() - 90000); // 90 seconds ago
    
    expect(responder.isHealthy).toBe(false);
    expect(responder.status).toBe('offline');
  });

  it('should be offline when inactive', () => {
    const responder = new Responder();
    responder.isActive = false;
    responder.lastSeen = new Date(); // Just now
    
    expect(responder.isHealthy).toBe(false);
    expect(responder.status).toBe('offline');
  });
});