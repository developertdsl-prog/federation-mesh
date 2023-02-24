const queryComplexityGuard = require('../middleware/queryComplexityGuard');

describe('QueryComplexityGuard Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.MAX_QUERY_DEPTH = '4';
    process.env.MAX_QUERY_COMPLEXITY = '50';
  });

  test('should allow queries within depth and complexity limits', () => {
    req.body.query = 'query { users { id name } }';
    queryComplexityGuard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should reject queries exceeding maximum nesting depth', () => {
    req.body.query = `
      query DeepQuery {
        orders {
          products {
            inventory {
              product {
                inventory {
                  quantity
                }
              }
            }
          }
        }
      }
    `;

    queryComplexityGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            extensions: expect.objectContaining({ code: 'DEPTH_LIMIT_EXCEEDED' }),
          }),
        ]),
      })
    );
  });
});
