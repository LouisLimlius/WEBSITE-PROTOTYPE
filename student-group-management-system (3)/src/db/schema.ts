import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().default(""),
  lecturer: text("lecturer").notNull().default(""),
  maxMembers: integer("max_members").notNull().default(4),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("groups_course_idx").on(t.courseId)]
);

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  nim: text("nim").notNull().unique(),
  name: text("name").notNull(),
  /** Token sesi mahasiswa — null berarti belum pernah check-in. */
  token: text("token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.studentId] }),
    index("memberships_student_idx").on(t.studentId),
  ]
);

export const votes = pgTable(
  "votes",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    voterId: uuid("voter_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.voterId] })]
);

export type Course = typeof courses.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Vote = typeof votes.$inferSelect;
