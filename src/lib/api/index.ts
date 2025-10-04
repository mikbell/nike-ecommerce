import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse, PaginatedResponse, AppError } from '@/types';
import { getErrorMessage } from '@/lib/utils';

// === Error Classes ===
export class ApiError extends Error implements AppError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// === Response Helpers ===
export function createResponse<T>(
  data: T,
  options: {
    status?: number;
    message?: string;
    headers?: Record<string, string>;
  } = {}
): NextResponse<ApiResponse<T>> {
  const { status = 200, message = 'Success', headers = {} } = options;

  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response, { status, headers });
}

export function createErrorResponse(
  error: unknown,
  options: {
    status?: number;
    message?: string;
    headers?: Record<string, string>;
  } = {}
): NextResponse<ApiResponse> {
  const { headers = {} } = options;

  let status = options.status || 500;
  let message = options.message || 'Internal server error';
  let code: string | undefined;
  let details: Record<string, unknown> | undefined;

  if (error instanceof ApiError) {
    status = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error instanceof z.ZodError) {
    status = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = {
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } else {
    message = getErrorMessage(error);
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(code && { code }),
    ...(details && { details }),
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  return NextResponse.json(response, { status, headers });
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  options: {
    status?: number;
    message?: string;
    headers?: Record<string, string>;
  } = {}
): NextResponse<PaginatedResponse<T>> {
  const { status = 200, message = 'Success', headers = {} } = options;
  const { page, limit, total } = pagination;

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  return NextResponse.json(response, { status, headers });
}

// === Request Validation ===
export function validateQuery<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  try {
    return schema.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters', {
        issues: error.issues,
      });
    }
    throw error;
  }
}

export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON body');
    }
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request body', {
        issues: error.issues,
      });
    }
    throw error;
  }
}

// === Pagination Helpers ===
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function parseSort(searchParams: URLSearchParams, allowedFields: string[]) {
  const sort = searchParams.get('sort');
  if (!sort) return null;

  const [field, direction] = sort.split(':');
  
  if (!allowedFields.includes(field)) {
    throw new ValidationError(`Invalid sort field: ${field}`);
  }

  if (direction && !['asc', 'desc'].includes(direction)) {
    throw new ValidationError(`Invalid sort direction: ${direction}`);
  }

  return {
    field,
    direction: (direction as 'asc' | 'desc') || 'asc',
  };
}

// === Middleware Creators ===
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

export function withValidation<TQuery = any, TBody = any>(options: {
  querySchema?: z.ZodSchema<TQuery>;
  bodySchema?: z.ZodSchema<TBody>;
}) {
  return function middleware<T extends Record<string, any>>(
    handler: (
      request: NextRequest,
      context: T & { query?: TQuery; body?: TBody }
    ) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: T): Promise<NextResponse> => {
      try {
        const validatedContext = { ...context } as T & { query?: TQuery; body?: TBody };

        // Validate query parameters
        if (options.querySchema) {
          validatedContext.query = validateQuery(request, options.querySchema);
        }

        // Validate request body
        if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
          validatedContext.body = await validateBody(request, options.bodySchema);
        }

        return await handler(request, validatedContext);
      } catch (error) {
        return createErrorResponse(error);
      }
    };
  };
}

export function withCors(
  options: {
    origins?: string[];
    methods?: string[];
    headers?: string[];
  } = {}
) {
  const {
    origins = ['*'],
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
  } = options;

  return function middleware<T extends Record<string, any>>(
    handler: (request: NextRequest, context: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: T): Promise<NextResponse> => {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origins.join(','),
            'Access-Control-Allow-Methods': methods.join(','),
            'Access-Control-Allow-Headers': headers.join(','),
          },
        });
      }

      const response = await handler(request, context);

      // Add CORS headers to the response
      response.headers.set('Access-Control-Allow-Origin', origins.join(','));
      response.headers.set('Access-Control-Allow-Methods', methods.join(','));
      response.headers.set('Access-Control-Allow-Headers', headers.join(','));

      return response;
    };
  };
}

// === Rate Limiting (Simple Implementation) ===
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(options: {
  maxRequests?: number;
  windowMs?: number;
  keyGenerator?: (request: NextRequest) => string;
} = {}) {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    keyGenerator = (request) => {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
      return ip;
    },
  } = options;

  return function middleware<T extends Record<string, any>>(
    handler: (request: NextRequest, context: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: T): Promise<NextResponse> => {
      const key = keyGenerator(request);
      const now = Date.now();
      const requestData = requestCounts.get(key);

      if (!requestData || now > requestData.resetTime) {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
      } else {
        requestData.count++;
        if (requestData.count > maxRequests) {
          return createErrorResponse(
            new ApiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
            {
              headers: {
                'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString(),
              },
            }
          );
        }
      }

      return await handler(request, context);
    };
  };
}

// === Common Validation Schemas ===
export const PaginationSchema = z.object({
  page: z.string().transform(val => Math.max(1, parseInt(val) || 1)),
  limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val) || 20))),
});

export const SortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const SearchSchema = z.object({
  q: z.string().min(1).optional(),
});

// === Compose Multiple Middleware ===
export function composeMiddleware<T extends Record<string, any>>(
  ...middlewares: Array<(
    handler: (request: NextRequest, context: T) => Promise<NextResponse>
  ) => (request: NextRequest, context: T) => Promise<NextResponse>>
) {
  return function (
    handler: (request: NextRequest, context: T) => Promise<NextResponse>
  ) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}