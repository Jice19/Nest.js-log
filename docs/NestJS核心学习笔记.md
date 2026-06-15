# NestJS 核心学习笔记

> 基于 NestJS 核心模块架构图整理

## 目录

1. [项目初始化与CLI命令](#1-项目初始化与cli命令)
2. [核心装饰器](#2-核心装饰器-controller-param-get-post-put)
3. [服务层与依赖注入](#3-服务层与依赖注入-injectable)
4. [模块系统](#4-模块系统-module)
5. [日志系统](#5-日志系统)
6. [中间件 - Middleware](#6-中间件---middleware)
7. [过滤器 - Exception Filters](#7-过滤器---exception-filters)
8. [管道 - Pipes](#8-管道---pipes)
9. [守卫 - Guards](#9-守卫---guards)
10. [拦截器 - Interceptors](#10-拦截器---interceptors)
11. [数据库连表查询 - Join On](#11-数据库连表查询---join-on)

---

## 1. 项目初始化与CLI命令

```bash
# 创建新项目
nest new nest-basic

# 查看所有可用命令
nest -h

# 生成模块 (module)
nest g mo auth

# 生成服务 (service)
nest g s auth

# 生成控制器 (controller)
nest g c auth
```

| 命令 | 缩写 | 作用 |
|------|------|------|
| `nest g mo` | generate module | 创建/初始化模块 |
| `nest g s` | generate service | 创建服务层 |
| `nest g c` | generate controller | 创建控制器 |

---

## 2. 核心装饰器: @Controller, @Param, @Get, @Post, @Put

```typescript
import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';

@Controller('users')        // 路由前缀 /users
export class UserController {

  @Get()                    // GET /users
  findAll() {
    return '获取所有用户';
  }

  @Get(':id')               // GET /users/:id
  findOne(@Param('id') id: string) {
    return `获取用户 ${id}`;
  }

  @Post()                   // POST /users
  create(@Body() dto: CreateUserDto) {
    return '创建用户';
  }

  @Put(':id')               // PUT /users/:id
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return `更新用户 ${id}`;
  }
}
```

| 装饰器 | 说明 |
|--------|------|
| `@Controller(prefix)` | 定义控制器，可选路由前缀 |
| `@Get(path)` | GET 请求 |
| `@Post(path)` | POST 请求 |
| `@Put(path)` | PUT 请求 |
| `@Param(key)` | 提取路由参数 |
| `@Body()` | 提取请求体 |
| `@Query()` | 提取查询参数 |

---

## 3. 服务层与依赖注入 (@Injectable)

`@Injectable()` 装饰器将类标记为可注入的服务，Nest 通过 **IoC 容器** 自动将服务注入到 Controller。

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  findAll() {
    return ['user1', 'user2'];
  }
}
```

```typescript
@Controller('users')
export class UserController {
  // 自动注入 UserService
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
```

### 跨模块共享服务

要在其他模块中使用某个服务，需要在 Module 中将该服务加入 `providers` 白名单，并通过 `exports` 导出：

```typescript
// user.module.ts
@Module({
  controllers: [UserController],
  providers: [UserService],    // 白名单注册
  exports: [UserService],      // 导出给其他模块使用
})
export class UserModule {}

// auth.module.ts
@Module({
  imports: [UserModule],       // 导入模块即可使用其导出的服务
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

---

## 4. 模块系统 (@Module)

每个功能模块必须有一个 `@Module` 装饰器，管理三要素：

```
@Module
├── imports      → 导入其他模块
├── controllers  → 注册控制器（路由层）
├── providers    → 注册服务（业务层）
└── exports      → 导出服务给外部模块使用
```

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],           // 依赖的其他模块
  controllers: [],       // 该模块的控制器
  providers: [],         // 该模块的服务/提供者
  exports: [],           // 对外暴露的服务
})
export class AppModule {}
```

> **核心原则**: 每个模块职责单一，通过 `imports/exports` 实现模块间协作。

---

## 5. 日志系统

NestJS 内置 Logger，无需 `console.log`：

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  findAll() {
    this.logger.log('查询所有用户');
    this.logger.warn('这是一个警告');
    this.logger.error('这是一个错误');
    this.logger.debug('调试信息');
    return [];
  }
}
```

---

## 6. 中间件 - Middleware

**特点**：遵循 **洋葱模型**（先进后出），在请求到达路由之前和响应返回之后执行。

### 实现步骤

1. 使用 `@Injectable()` 注册
2. **必须** `implements NestMiddleware`
3. 实现 `use(req, res, next)` 方法

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('请求进入...');    // 前置处理
    next();                         // 必须调用 next()
    console.log('响应返回...');    // 后置处理（洋葱模型）
  }
}
```

### 洋葱模型示意图

```
    请求进入 →
  ┌─────────────────────────────┐
  │  Middleware 1 (前置)        │
  │  ┌───────────────────────┐  │
  │  │ Middleware 2 (前置)    │  │
  │  │  ┌─────────────────┐  │  │
  │  │  │   Controller    │  │  │
  │  │  └─────────────────┘  │  │
  │  │ Middleware 2 (后置)    │  │
  │  └───────────────────────┘  │
  │  Middleware 1 (后置)        │
  └─────────────────────────────┘
              → 响应返回
```

### 局部中间件 vs 全局中间件

```typescript
// 局部中间件 - 在模块中配置
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('users');     // 只对 /users 路由生效
  }
}

// 全局中间件 - 在 main.ts 中注册
const app = await NestFactory.create(AppModule);
app.use(new LoggerMiddleware());  // 对所有路由生效
```

---

## 7. 过滤器 - Exception Filters

**作用**：捕获异常、统一错误处理格式。

### 实现步骤

1. 使用 `@Catch()` 装饰器（指定要捕获的异常类型）
2. `implements ExceptionFilter`
3. 实现 `catch(exception, host)` 方法

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)            // 捕获 HttpException
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      code: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 使用方式

```typescript
// 局部使用
@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UserController {}

// 全局使用 (main.ts)
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 8. 管道 - Pipes

**作用**：对请求数据进行 **转换** 和 **校验**。

### 实现步骤

1. 使用 `@Injectable()` 注册
2. `implements PipeTransform`
3. 实现 `transform(value, metadata)` 方法

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('参数必须是数字');
    }
    return val;
  }
}
```

### 使用方式

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {  // 自动转换为数字
  return this.userService.findOne(id);
}
```

---

## 9. 守卫 - Guards

**作用**：身份校验、权限控制（在请求到达路由处理器之前执行）。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // 校验 token / session
    return !!request.headers.authorization;
  }
}
```

### 使用方式

```typescript
@Controller('admin')
@UseGuards(AuthGuard)          // 整个控制器都需要认证
export class AdminController {}

@Get('profile')
@UseGuards(AuthGuard)          // 单个路由需要认证
getProfile() {}
```

---

## 10. 拦截器 - Interceptors

**作用**：拦截请求和响应，进行统一的日志记录、数据转换等。

> **与中间件的区别**：中间件范围更广（可以处理原始 request/response），拦截器更关注 **Controller 前后** 的处理，中间件可以替代拦截器。

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('请求前...');                        // 前置处理
    return next.handle().pipe(
      map(data => ({                                  // 后置处理
        code: 200,
        data,
        message: 'success',
      })),
    );
  }
}
```

### 对比总结

| 机制 | 触发时机 | 关注点 |
|------|---------|--------|
| **Middleware** | 路由前后（最外层） | 请求/响应通用处理 |
| **Guards** | 中间件之后、拦截器之前 | 身份认证、权限 |
| **Pipes** | 请求参数处理阶段 | 数据转换与校验 |
| **Interceptors** | Controller 前后 | 响应格式化、缓存 |
| **Filters** | 异常发生时 | 错误统一处理 |

**执行顺序**：`Middleware → Guards → Pipes → Controller → Interceptors → Filters（异常时）`

### 请求生命周期

```
请求 → 全局中间件 → 模块中间件 → Guards → Pipes
                                          ↓
响应 ← 全局中间件 ← 模块中间件 ← Interceptors ← Controller
                                          ↑
                                    Filters（异常时）
```

---

## 11. 数据库连表查询 - Join On

在 NestJS 中通常结合 **TypeORM** 或 **Prisma** 进行连表操作：

### TypeORM 实体关系

```typescript
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}

// post.entity.ts
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### QueryBuilder 连表查询

```typescript
// JOIN ON 方式
const result = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')      // LEFT JOIN post ON post.user_id = user.id
  .where('user.id = :id', { id: 1 })
  .getOne();
```

### 原生 SQL JOIN

```sql
-- INNER JOIN: 只返回匹配的行
SELECT * FROM "user"
INNER JOIN "post" ON "user"."id" = "post"."user_id";

-- LEFT JOIN: 返回左表所有行
SELECT * FROM "user"
LEFT JOIN "post" ON "user"."id" = "post"."user_id";
```

| JOIN 类型 | 说明 |
|-----------|------|
| INNER JOIN | 两表都匹配才返回 |
| LEFT JOIN | 左表全返回，右表无匹配为 NULL |
| RIGHT JOIN | 右表全返回，左表无匹配为 NULL |
| FULL JOIN | 两表全部返回 |

---

## NestJS 请求生命周期完整流程图

```
                ┌──────────┐
                │  Request │
                └────┬─────┘
                     ↓
            ┌────────────────┐
            │  Middleware    │  ← 洋葱模型，先进后出
            └───────┬────────┘
                    ↓
            ┌──────────────┐
            │   Guards     │  ← 身份校验、权限判断
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │   Pipes      │  ← 数据转换/校验
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │  Controller  │
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │ Interceptors │  ← 响应拦截/格式化
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │   Response   │
            └──────────────┘

      异常时 → Filters 捕获处理
```
