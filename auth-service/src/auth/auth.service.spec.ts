// import { AuthService } from './auth.service';

// describe('AuthService', () => {
//   let authService: AuthService;

//   beforeEach(() => {
//     authService = new AuthService();
//   });

//   describe('validateUser', () => {
//     it('should return true for correct credentials', () => {
//       expect(authService.validateUser('admin', '123456')).toBe(true);
//     });

//     it('should return false for wrong credentials', () => {
//       expect(authService.validateUser('user', 'wrong')).toBe(false);
//     });
//   });

//   describe('generateToken', () => {
//     it('should return a token string containing userId', () => {
//       const token = authService.generateToken('abc123');
//       expect(token).toContain('abc123');
//     });

//     it('should return a different token each time', () => {
//       const token1 = authService.generateToken('abc');
//       const token2 = authService.generateToken('abc');
//       expect(token1).not.toBe(token2);
//     });
//   });
// });
