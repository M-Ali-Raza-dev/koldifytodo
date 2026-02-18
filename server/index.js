import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const requestedDbName = process.env.MONGODB_DB_NAME || 'koldify_todolist';
const dbName = requestedDbName.replace(/\s+/g, '_');
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CEO: 'ceo',
  EMPLOYEE: 'employee',
};

if (!mongoUri) {
  throw new Error('MONGODB_URI is required in .env');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required in .env');
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  }),
);
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    status: { type: String, enum: ['online', 'away', 'offline'], default: 'online' },
    role: { type: String, enum: ['super_admin', 'ceo', 'employee'], default: 'employee' },
    is_active: { type: Boolean, default: true },
    last_login: { type: Date, default: Date.now },
    temporary_access: {
      type: [
        {
          module: { type: String, required: true },
          expires_at: { type: Date, required: true },
          granted_by: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

userSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password_hash;
    return ret;
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'blocked'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    due_date: { type: String, required: true },
    assigned_to: { type: String, required: true },
    created_by: { type: String, required: true },
    related_name: { type: String },
    tags: { type: [String], default: [] },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

taskSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const calendarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    location: { type: String, default: '' },
    all_day: { type: Boolean, default: false },
    color: { type: String, default: 'blue' },
    event_type: { type: String, enum: ['meeting', 'deadline', 'reminder', 'other'], default: 'meeting' },
    attendees: { type: [String], default: [] },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const clientSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
    monthly_fee: { type: Number, required: true },
    contact_name: { type: String, default: '' },
    contact_email: { type: String, default: '' },
    contact_phone: { type: String, default: '' },
    guarantee_leads: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const projectSchema = new mongoose.Schema(
  {
    project_name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['planning', 'in_progress', 'completed', 'on_hold'], default: 'planning' },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    team_members: { type: [String], default: [] },
    client_id: { type: String, default: '' },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const tenantSchema = new mongoose.Schema(
  {
    tenant_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    monthly_cost: { type: Number, required: true },
    renewal_date: { type: Date, required: true },
    features: { type: [String], default: [] },
    description: { type: String, default: '' },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const inboxSchema = new mongoose.Schema(
  {
    inbox_email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'warming', 'burned', 'paused'], default: 'warming' },
    bounce_rate: { type: Number, default: 0 },
    spam_rate: { type: Number, default: 0 },
    tenant_id: { type: String, required: true },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const domainSchema = new mongoose.Schema(
  {
    domain_name: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },
    registrar: { type: String, default: '' },
    renewal_date: { type: Date, required: true },
    auto_renew: { type: Boolean, default: true },
    dns_records: { type: [String], default: [] },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const toolSchema = new mongoose.Schema(
  {
    tool_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'trial'], default: 'active' },
    cost: { type: Number, required: true },
    billing_cycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    renewal_date: { type: Date, required: true },
    autopay: { type: Boolean, default: true },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const campaignSchema = new mongoose.Schema(
  {
    campaign_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
    sent_emails: { type: Number, default: 0 },
    open_rate: { type: Number, default: 0 },
    click_rate: { type: Number, default: 0 },
    reply_rate: { type: Number, default: 0 },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    assigned_team: { type: [String], default: [] },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const guaranteeSchema = new mongoose.Schema(
  {
    client_id: { type: String, required: true },
    guarantee_leads: { type: Number, required: true },
    delivered_leads: { type: Number, default: 0 },
    status: { type: String, enum: ['met', 'at_risk', 'pending'], default: 'pending' },
    period_start: { type: Date, required: true },
    period_end: { type: Date, required: true },
    notes: { type: String, default: '' },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const automationSchema = new mongoose.Schema(
  {
    automation_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'paused', 'error'], default: 'active' },
    type: { type: String, enum: ['email_sequence', 'webhook', 'task_creation', 'data_sync'], default: 'email_sequence' },
    trigger: { type: String, required: true },
    actions: { type: [String], default: [] },
    executions: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
    last_run: { type: Date },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const renewalSchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true },
    item_type: { type: String, enum: ['domain', 'tool', 'tenant', 'service'], required: true },
    renewal_date: { type: Date, required: true },
    cost: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'due_soon', 'overdue', 'renewed'], default: 'upcoming' },
    autopay: { type: Boolean, default: false },
    created_by: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

// Transform all new schemas
[calendarSchema, clientSchema, projectSchema, tenantSchema, inboxSchema, domainSchema, toolSchema, campaignSchema, guaranteeSchema, automationSchema, renewalSchema].forEach(schema => {
  schema.set('toJSON', {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Calendar = mongoose.model('Calendar', calendarSchema);
const Client = mongoose.model('Client', clientSchema);
const Project = mongoose.model('Project', projectSchema);
const Tenant = mongoose.model('Tenant', tenantSchema);
const Inbox = mongoose.model('Inbox', inboxSchema);
const Domain = mongoose.model('Domain', domainSchema);
const Tool = mongoose.model('Tool', toolSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);
const Guarantee = mongoose.model('Guarantee', guaranteeSchema);
const Automation = mongoose.model('Automation', automationSchema);
const Renewal = mongoose.model('Renewal', renewalSchema);
const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor_email: { type: String, required: true },
    target_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target_user_email: { type: String },
    details: { type: String },
    destructive: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

auditLogSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    jwtSecret,
    { expiresIn: '7d' },
  );

const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;
const isCEO = (user) => user?.role === ROLES.CEO;
const isEmployee = (user) => user?.role === ROLES.EMPLOYEE;

const logAudit = async ({
  action,
  actor,
  targetUser,
  details,
  destructive = false,
}) => {
  await AuditLog.create({
    action,
    actor_id: actor._id,
    actor_email: actor.email,
    target_user_id: targetUser?._id,
    target_user_email: targetUser?.email,
    details,
    destructive,
  });
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.sub);

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      full_name: String(full_name).trim(),
      email: normalizedEmail,
      password_hash,
      role: 'employee',
      last_login: new Date(),
      timezone: 'UTC',
      status: 'online',
      is_active: true,
    });

    const publicUser = user.toJSON();
    const token = createToken(publicUser);

    return res.status(201).json({ token, user: publicUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: String(error) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.last_login = new Date();
    await user.save();

    const publicUser = user.toJSON();
    const token = createToken(publicUser);

    return res.status(200).json({ token, user: publicUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: String(error) });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

app.get('/api/users', authMiddleware, async (req, res) => {
  if (isSuperAdmin(req.user)) {
    const users = await User.find().sort({ created_at: -1 });
    return res.json({ users: users.map((user) => user.toJSON()) });
  }

  if (isCEO(req.user)) {
    // CEO sees all users (including super_admin, but displayed as normal users)
    const users = await User.find({ is_active: true }).sort({ created_at: -1 });
    return res.json({
      users: users.map((user) => {
        const publicUser = user.toJSON();
        if (publicUser.role === ROLES.SUPER_ADMIN) {
          return { ...publicUser, role: ROLES.EMPLOYEE };
        }
        return publicUser;
      }),
    });
  }

  return res.status(403).json({ message: 'Forbidden' });
});

app.post('/api/users', authMiddleware, requireRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { full_name, email, password, role = ROLES.EMPLOYEE } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password are required' });
    }

    if (![ROLES.SUPER_ADMIN, ROLES.CEO, ROLES.EMPLOYEE].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      full_name: String(full_name).trim(),
      email: normalizedEmail,
      password_hash,
      role,
      timezone: 'UTC',
      status: 'online',
      is_active: true,
      last_login: new Date(),
    });

    await logAudit({
      action: 'create_user',
      actor: req.user,
      targetUser: user,
      details: `Created user with role ${role}`,
      destructive: false,
    });

    return res.status(201).json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: String(error) });
  }
});

app.patch('/api/users/:id', authMiddleware, requireRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const originalRole = user.role;
    const originalActive = user.is_active;

    if (full_name !== undefined) user.full_name = String(full_name).trim();
    if (role !== undefined) {
      if (![ROLES.SUPER_ADMIN, ROLES.CEO, ROLES.EMPLOYEE].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      user.role = role;
    }
    if (typeof is_active === 'boolean') user.is_active = is_active;

    await user.save();

    const destructive = originalActive && user.is_active === false;
    await logAudit({
      action: 'update_user',
      actor: req.user,
      targetUser: user,
      details: `Role: ${originalRole} -> ${user.role}; Active: ${originalActive} -> ${user.is_active}`,
      destructive,
    });

    return res.json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user', error: String(error) });
  }
});

app.patch('/api/users/:id/password', authMiddleware, requireRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'password is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password_hash = await bcrypt.hash(String(password), 10);
    await user.save();

    await logAudit({
      action: 'reset_password',
      actor: req.user,
      targetUser: user,
      details: 'Password reset by super admin',
      destructive: true,
    });

    return res.json({ message: 'Password updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password', error: String(error) });
  }
});

app.patch('/api/users/:id/elevated-access', authMiddleware, requireRoles(ROLES.SUPER_ADMIN, ROLES.CEO), async (req, res) => {
  try {
    const { id } = req.params;
    const { module, expires_in_hours = 24, revoke = false } = req.body;

    if (!module) {
      return res.status(400).json({ message: 'module is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isCEO(req.user) && user.role !== ROLES.EMPLOYEE) {
      return res.status(403).json({ message: 'CEO can grant elevated access to employees only' });
    }

    const existing = user.temporary_access?.filter((entry) => entry.module !== module) || [];
    if (!revoke) {
      existing.push({
        module,
        expires_at: new Date(Date.now() + Number(expires_in_hours) * 60 * 60 * 1000),
        granted_by: req.user.email,
      });
    }
    user.temporary_access = existing;
    await user.save();

    await logAudit({
      action: revoke ? 'revoke_elevated_access' : 'grant_elevated_access',
      actor: req.user,
      targetUser: user,
      details: `${revoke ? 'Revoked' : 'Granted'} module ${module}`,
      destructive: false,
    });

    return res.json({ user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to change elevated access', error: String(error) });
  }
});

app.delete('/api/users/:id', authMiddleware, requireRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logAudit({
      action: 'delete_user',
      actor: req.user,
      targetUser: deletedUser,
      details: 'User deleted by super admin',
      destructive: true,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', error: String(error) });
  }
});

// Calendar endpoints
app.get('/api/calendar', authMiddleware, async (req, res) => {
  try {
    const events = await Calendar.find({ owner_id: req.user.id }).sort({ start_date: 1 });
    return res.json({ events: events.map((e) => e.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch calendar events', error: String(error) });
  }
});

app.post('/api/calendar', authMiddleware, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, all_day, color, event_type, attendees } = req.body;
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ message: 'title, start_date, and end_date are required' });
    }
    const event = new Calendar({
      title, description, start_date, end_date, location, all_day, color, event_type, attendees,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await event.save();
    return res.status(201).json({ event: event.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create event', error: String(error) });
  }
});

app.patch('/api/calendar/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);
    if (!event || event.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Event not found' });
    }
    Object.assign(event, req.body);
    await event.save();
    return res.json({ event: event.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update event', error: String(error) });
  }
});

app.delete('/api/calendar/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);
    if (!event || event.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.deleteOne();
    return res.json({ message: 'Event deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete event', error: String(error) });
  }
});

// Client endpoints
app.get('/api/clients', authMiddleware, async (req, res) => {
  try {
    const clients = await Client.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ clients: clients.map((c) => c.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch clients', error: String(error) });
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  try {
    const { company_name, status, monthly_fee, contact_name, contact_email, contact_phone, guarantee_leads, notes } = req.body;
    if (!company_name || monthly_fee === undefined) {
      return res.status(400).json({ message: 'company_name and monthly_fee are required' });
    }
    const client = new Client({
      company_name, status, monthly_fee, contact_name, contact_email, contact_phone, guarantee_leads, notes,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await client.save();
    return res.status(201).json({ client: client.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create client', error: String(error) });
  }
});

app.patch('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client || client.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Client not found' });
    }
    Object.assign(client, req.body);
    await client.save();
    return res.json({ client: client.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update client', error: String(error) });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client || client.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Client not found' });
    }
    await client.deleteOne();
    return res.json({ message: 'Client deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete client', error: String(error) });
  }
});

// Project endpoints
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ projects: projects.map((p) => p.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch projects', error: String(error) });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { project_name, description, status, start_date, end_date, budget, team_members, client_id } = req.body;
    if (!project_name || !start_date) {
      return res.status(400).json({ message: 'project_name and start_date are required' });
    }
    const project = new Project({
      project_name, description, status, start_date, end_date, budget, team_members, client_id,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await project.save();
    return res.status(201).json({ project: project.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create project', error: String(error) });
  }
});

app.patch('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    Object.assign(project, req.body);
    await project.save();
    return res.json({ project: project.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update project', error: String(error) });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.deleteOne();
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete project', error: String(error) });
  }
});

// Tenant endpoints
app.get('/api/tenants', authMiddleware, async (req, res) => {
  try {
    const tenants = await Tenant.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ tenants: tenants.map((t) => t.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tenants', error: String(error) });
  }
});

app.post('/api/tenants', authMiddleware, async (req, res) => {
  try {
    const { tenant_name, status, monthly_cost, renewal_date, features, description } = req.body;
    if (!tenant_name || !monthly_cost || !renewal_date) {
      return res.status(400).json({ message: 'tenant_name, monthly_cost, and renewal_date are required' });
    }
    const tenant = new Tenant({
      tenant_name, status, monthly_cost, renewal_date, features, description,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await tenant.save();
    return res.status(201).json({ tenant: tenant.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create tenant', error: String(error) });
  }
});

app.patch('/api/tenants/:id', authMiddleware, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    Object.assign(tenant, req.body);
    await tenant.save();
    return res.json({ tenant: tenant.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update tenant', error: String(error) });
  }
});

app.delete('/api/tenants/:id', authMiddleware, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    await tenant.deleteOne();
    return res.json({ message: 'Tenant deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete tenant', error: String(error) });
  }
});

// Inbox endpoints
app.get('/api/inboxes', authMiddleware, async (req, res) => {
  try {
    const inboxes = await Inbox.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ inboxes: inboxes.map((i) => i.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch inboxes', error: String(error) });
  }
});

app.post('/api/inboxes', authMiddleware, async (req, res) => {
  try {
    const { inbox_email, status, tenant_id } = req.body;
    if (!inbox_email || !tenant_id) {
      return res.status(400).json({ message: 'inbox_email and tenant_id are required' });
    }
    const inbox = new Inbox({
      inbox_email, status, tenant_id,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await inbox.save();
    return res.status(201).json({ inbox: inbox.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create inbox', error: String(error) });
  }
});

app.patch('/api/inboxes/:id', authMiddleware, async (req, res) => {
  try {
    const inbox = await Inbox.findById(req.params.id);
    if (!inbox || inbox.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Inbox not found' });
    }
    Object.assign(inbox, req.body);
    await inbox.save();
    return res.json({ inbox: inbox.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update inbox', error: String(error) });
  }
});

app.delete('/api/inboxes/:id', authMiddleware, async (req, res) => {
  try {
    const inbox = await Inbox.findById(req.params.id);
    if (!inbox || inbox.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Inbox not found' });
    }
    await inbox.deleteOne();
    return res.json({ message: 'Inbox deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete inbox', error: String(error) });
  }
});

// Domain endpoints
app.get('/api/domains', authMiddleware, async (req, res) => {
  try {
    const domains = await Domain.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ domains: domains.map((d) => d.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch domains', error: String(error) });
  }
});

app.post('/api/domains', authMiddleware, async (req, res) => {
  try {
    const { domain_name, registrar, renewal_date } = req.body;
    if (!domain_name || !renewal_date) {
      return res.status(400).json({ message: 'domain_name and renewal_date are required' });
    }
    const domain = new Domain({
      domain_name, registrar, renewal_date,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await domain.save();
    return res.status(201).json({ domain: domain.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create domain', error: String(error) });
  }
});

app.patch('/api/domains/:id', authMiddleware, async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain || domain.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    Object.assign(domain, req.body);
    await domain.save();
    return res.json({ domain: domain.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update domain', error: String(error) });
  }
});

app.delete('/api/domains/:id', authMiddleware, async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id);
    if (!domain || domain.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    await domain.deleteOne();
    return res.json({ message: 'Domain deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete domain', error: String(error) });
  }
});

// Tools/Billing endpoints
app.get('/api/tools', authMiddleware, async (req, res) => {
  try {
    const tools = await Tool.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ tools: tools.map((t) => t.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tools', error: String(error) });
  }
});

app.post('/api/tools', authMiddleware, async (req, res) => {
  try {
    const { tool_name, cost, renewal_date, billing_cycle } = req.body;
    if (!tool_name || cost === undefined || !renewal_date) {
      return res.status(400).json({ message: 'tool_name, cost, and renewal_date are required' });
    }
    const tool = new Tool({
      tool_name, cost, renewal_date, billing_cycle,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await tool.save();
    return res.status(201).json({ tool: tool.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create tool', error: String(error) });
  }
});

app.patch('/api/tools/:id', authMiddleware, async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool || tool.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    Object.assign(tool, req.body);
    await tool.save();
    return res.json({ tool: tool.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update tool', error: String(error) });
  }
});

app.delete('/api/tools/:id', authMiddleware, async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool || tool.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    await tool.deleteOne();
    return res.json({ message: 'Tool deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete tool', error: String(error) });
  }
});

// Campaigns endpoints
app.get('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ campaigns: campaigns.map((c) => c.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch campaigns', error: String(error) });
  }
});

app.post('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const { campaign_name, start_date } = req.body;
    if (!campaign_name || !start_date) {
      return res.status(400).json({ message: 'campaign_name and start_date are required' });
    }
    const campaign = new Campaign({
      campaign_name, start_date,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await campaign.save();
    return res.status(201).json({ campaign: campaign.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create campaign', error: String(error) });
  }
});

app.patch('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || campaign.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    Object.assign(campaign, req.body);
    await campaign.save();
    return res.json({ campaign: campaign.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update campaign', error: String(error) });
  }
});

app.delete('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || campaign.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    await campaign.deleteOne();
    return res.json({ message: 'Campaign deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete campaign', error: String(error) });
  }
});

// Guarantees endpoints
app.get('/api/guarantees', authMiddleware, async (req, res) => {
  try {
    const guarantees = await Guarantee.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ guarantees: guarantees.map((g) => g.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch guarantees', error: String(error) });
  }
});

app.post('/api/guarantees', authMiddleware, async (req, res) => {
  try {
    const { client_id, guarantee_leads, period_start, period_end } = req.body;
    if (!client_id || !guarantee_leads || !period_start || !period_end) {
      return res.status(400).json({ message: 'client_id, guarantee_leads, period_start, and period_end are required' });
    }
    const guarantee = new Guarantee({
      client_id, guarantee_leads, period_start, period_end,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await guarantee.save();
    return res.status(201).json({ guarantee: guarantee.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create guarantee', error: String(error) });
  }
});

app.patch('/api/guarantees/:id', authMiddleware, async (req, res) => {
  try {
    const guarantee = await Guarantee.findById(req.params.id);
    if (!guarantee || guarantee.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Guarantee not found' });
    }
    Object.assign(guarantee, req.body);
    await guarantee.save();
    return res.json({ guarantee: guarantee.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update guarantee', error: String(error) });
  }
});

app.delete('/api/guarantees/:id', authMiddleware, async (req, res) => {
  try {
    const guarantee = await Guarantee.findById(req.params.id);
    if (!guarantee || guarantee.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Guarantee not found' });
    }
    await guarantee.deleteOne();
    return res.json({ message: 'Guarantee deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete guarantee', error: String(error) });
  }
});

// Automation endpoints
app.get('/api/automations', authMiddleware, async (req, res) => {
  try {
    const automations = await Automation.find({ owner_id: req.user.id }).sort({ created_at: -1 });
    return res.json({ automations: automations.map((a) => a.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch automations', error: String(error) });
  }
});

app.post('/api/automations', authMiddleware, async (req, res) => {
  try {
    const { automation_name, type, trigger } = req.body;
    if (!automation_name || !type || !trigger) {
      return res.status(400).json({ message: 'automation_name, type, and trigger are required' });
    }
    const automation = new Automation({
      automation_name, type, trigger,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await automation.save();
    return res.status(201).json({ automation: automation.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create automation', error: String(error) });
  }
});

app.patch('/api/automations/:id', authMiddleware, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation || automation.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    Object.assign(automation, req.body);
    await automation.save();
    return res.json({ automation: automation.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update automation', error: String(error) });
  }
});

app.delete('/api/automations/:id', authMiddleware, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation || automation.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Automation not found' });
    }
    await automation.deleteOne();
    return res.json({ message: 'Automation deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete automation', error: String(error) });
  }
});

// Renewals endpoints
app.get('/api/renewals', authMiddleware, async (req, res) => {
  try {
    const renewals = await Renewal.find({ owner_id: req.user.id }).sort({ renewal_date: 1 });
    return res.json({ renewals: renewals.map((r) => r.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch renewals', error: String(error) });
  }
});

app.post('/api/renewals', authMiddleware, async (req, res) => {
  try {
    const { item_name, item_type, renewal_date, cost } = req.body;
    if (!item_name || !item_type || !renewal_date || cost === undefined) {
      return res.status(400).json({ message: 'item_name, item_type, renewal_date, and cost are required' });
    }
    const renewal = new Renewal({
      item_name, item_type, renewal_date, cost,
      created_by: req.user.full_name,
      owner_id: req.user.id,
    });
    await renewal.save();
    return res.status(201).json({ renewal: renewal.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create renewal', error: String(error) });
  }
});

app.patch('/api/renewals/:id', authMiddleware, async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);
    if (!renewal || renewal.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Renewal not found' });
    }
    Object.assign(renewal, req.body);
    await renewal.save();
    return res.json({ renewal: renewal.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update renewal', error: String(error) });
  }
});

app.delete('/api/renewals/:id', authMiddleware, async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);
    if (!renewal || renewal.owner_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Renewal not found' });
    }
    await renewal.deleteOne();
    return res.json({ message: 'Renewal deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete renewal', error: String(error) });
  }
});

app.get('/api/audit-logs', authMiddleware, requireRoles(ROLES.SUPER_ADMIN), async (_req, res) => {
  const logs = await AuditLog.find().sort({ created_at: -1 }).limit(1000);
  return res.json({ logs: logs.map((log) => log.toJSON()) });
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  const taskFilter =
    isSuperAdmin(req.user) || isCEO(req.user)
      ? {}
      : {
          $or: [{ owner_id: req.user._id }, { assigned_to: req.user.full_name }, { created_by: req.user.full_name }],
        };

  const tasks = await Task.find(taskFilter).sort({ created_at: -1 });
  res.json({ tasks: tasks.map((task) => task.toJSON()) });
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', due_date, assigned_to, related_name, tags = [] } = req.body;

    if (!title || !due_date || !assigned_to) {
      return res.status(400).json({ message: 'title, due_date and assigned_to are required' });
    }

    const createdTask = await Task.create({
      title: String(title).trim(),
      description: String(description),
      status,
      priority,
      due_date,
      assigned_to,
      created_by: req.user.full_name,
      related_name,
      tags: Array.isArray(tags) ? tags : [],
      owner_id: req.user._id,
    });

    return res.status(201).json({ task: createdTask.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task', error: String(error) });
  }
});

app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const whereClause =
      isSuperAdmin(req.user) || isCEO(req.user)
        ? { _id: id }
        : {
            _id: id,
            $or: [{ owner_id: req.user._id }, { assigned_to: req.user.full_name }, { created_by: req.user.full_name }],
          };

    const task = await Task.findOneAndUpdate(
      whereClause,
      updates,
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ task: task.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task', error: String(error) });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const whereClause =
      isSuperAdmin(req.user) || isCEO(req.user)
        ? { _id: id }
        : {
            _id: id,
            $or: [{ owner_id: req.user._id }, { assigned_to: req.user.full_name }, { created_by: req.user.full_name }],
          };

    const deleted = await Task.findOneAndDelete(whereClause);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await logAudit({
      action: 'delete_task',
      actor: req.user,
      details: `Deleted task ${deleted.title}`,
      destructive: true,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task', error: String(error) });
  }
});

const start = async () => {
  await mongoose.connect(mongoUri, { dbName });
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
    if (dbName !== requestedDbName) {
      console.log(`MongoDB database name adjusted to valid namespace: ${dbName}`);
    }
    console.log(`MongoDB database: ${dbName}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
