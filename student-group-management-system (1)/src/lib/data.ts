import { db } from "@/db";
import { courses, groups, memberships, students, votes } from "@/db/schema";
import { asc, eq, inArray, sql, and, ne } from "drizzle-orm";
import { electLeader } from "./utils";

/* ============ View Models (serializable, dipakai server + client) ============ */

export type MemberVM = {
  id: string;
  nim: string;
  name: string;
  joinedAt: string;
  voteCount: number;
  isKetua: boolean;
};

export type GroupVM = {
  id: string;
  name: string;
  courseId: string;
  memberCount: number;
  maxMembers: number;
  full: boolean;
  totalVotes: number;
  ketua: { id: string; name: string } | null;
  members: MemberVM[];
  createdAt: string;
};

export type CourseVM = {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  maxMembers: number;
  colorIndex: number;
  groups: GroupVM[];
  groupCount: number;
  fullGroupCount: number;
  ketuaTerpilih: number;
  registeredCount: number;
  unassignedCount: number;
  createdAt: string;
};

export type StudentVM = {
  id: string;
  nim: string;
  name: string;
  checkedIn: boolean;
  createdAt: string;
};

/* ============ Queries ============ */

async function groupVMsForCourses(courseRows: { id: string; maxMembers: number }[]): Promise<Map<string, GroupVM[]>> {
  const map = new Map<string, GroupVM[]>();
  if (courseRows.length === 0) return map;

  const courseIds = courseRows.map((c) => c.id);
  const maxByCourse = new Map(courseRows.map((c) => [c.id, c.maxMembers]));

  const groupRows = await db
    .select()
    .from(groups)
    .where(inArray(groups.courseId, courseIds))
    .orderBy(asc(groups.createdAt));

  if (groupRows.length === 0) return map;

  const groupIds = groupRows.map((g) => g.id);

  const memberRows = await db
    .select({
      groupId: memberships.groupId,
      studentId: students.id,
      nim: students.nim,
      name: students.name,
      joinedAt: memberships.joinedAt,
    })
    .from(memberships)
    .innerJoin(students, eq(students.id, memberships.studentId))
    .where(inArray(memberships.groupId, groupIds))
    .orderBy(asc(memberships.joinedAt));

  const voteRows = await db
    .select({ groupId: votes.groupId, candidateId: votes.candidateId })
    .from(votes)
    .where(inArray(votes.groupId, groupIds));

  for (const g of groupRows) {
    const mrows = memberRows.filter((m) => m.groupId === g.id);
    const vrows = voteRows.filter((v) => v.groupId === g.id);
    const counts = new Map<string, number>();
    for (const v of vrows) counts.set(v.candidateId, (counts.get(v.candidateId) ?? 0) + 1);
    const maxMembers = maxByCourse.get(g.courseId) ?? 4;
    const { leaderId, total } = electLeader(mrows.length, counts);
    const ketuaMember = leaderId ? mrows.find((m) => m.studentId === leaderId) : null;

    const members: MemberVM[] = mrows
      .map((m) => ({
        id: m.studentId,
        nim: m.nim,
        name: m.name,
        joinedAt: m.joinedAt.toISOString(),
        voteCount: counts.get(m.studentId) ?? 0,
        isKetua: m.studentId === leaderId,
      }))
      .sort((a, b) => Number(b.isKetua) - Number(a.isKetua) || a.name.localeCompare(b.name, "id"));

    const vm: GroupVM = {
      id: g.id,
      name: g.name,
      courseId: g.courseId,
      memberCount: mrows.length,
      maxMembers,
      full: mrows.length >= maxMembers,
      totalVotes: total,
      ketua: ketuaMember ? { id: ketuaMember.studentId, name: ketuaMember.name } : null,
      members,
      createdAt: g.createdAt.toISOString(),
    };
    if (!map.has(g.courseId)) map.set(g.courseId, []);
    map.get(g.courseId)!.push(vm);
  }
  return map;
}

async function unassignedCountForCourse(courseId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${memberships} m
        JOIN ${groups} g ON g.id = m.group_id
        WHERE m.student_id = ${students.id} AND g.course_id = ${courseId}
      )`
    );
  return rows[0]?.count ?? 0;
}

export async function listCourses(): Promise<CourseVM[]> {
  const courseRows = await db.select().from(courses).orderBy(asc(courses.createdAt));
  const gmap = await groupVMsForCourses(courseRows);
  const result: CourseVM[] = [];
  for (let i = 0; i < courseRows.length; i++) {
    const c = courseRows[i];
    const gs = gmap.get(c.id) ?? [];
    const registered = gs.reduce((s, g) => s + g.memberCount, 0);
    result.push({
      id: c.id,
      name: c.name,
      code: c.code,
      lecturer: c.lecturer,
      maxMembers: c.maxMembers,
      colorIndex: i,
      groups: gs,
      groupCount: gs.length,
      fullGroupCount: gs.filter((g) => g.full).length,
      ketuaTerpilih: gs.filter((g) => g.ketua).length,
      registeredCount: registered,
      unassignedCount: await unassignedCountForCourse(c.id),
      createdAt: c.createdAt.toISOString(),
    });
  }
  return result;
}

export async function getCourseDetail(id: string): Promise<CourseVM | null> {
  const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (rows.length === 0) return null;
  const all = await db.select().from(courses).orderBy(asc(courses.createdAt));
  const colorIndex = all.findIndex((c) => c.id === id);
  const c = rows[0];
  const gmap = await groupVMsForCourses([c]);
  const gs = gmap.get(c.id) ?? [];
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    lecturer: c.lecturer,
    maxMembers: c.maxMembers,
    colorIndex: colorIndex < 0 ? 0 : colorIndex,
    groups: gs,
    groupCount: gs.length,
    fullGroupCount: gs.filter((g) => g.full).length,
    ketuaTerpilih: gs.filter((g) => g.ketua).length,
    registeredCount: gs.reduce((s, g) => s + g.memberCount, 0),
    unassignedCount: await unassignedCountForCourse(c.id),
    createdAt: c.createdAt.toISOString(),
  };
}

export async function getGroupDetail(id: string): Promise<{ group: GroupVM; course: { id: string; name: string; code: string; lecturer: string; maxMembers: number; colorIndex: number } } | null> {
  const rows = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (rows.length === 0) return null;
  const g = rows[0];
  const courseRows = await db.select().from(courses).where(eq(courses.id, g.courseId)).limit(1);
  if (courseRows.length === 0) return null;
  const course = courseRows[0];
  const all = await db.select().from(courses).orderBy(asc(courses.createdAt));
  const colorIndex = all.findIndex((c) => c.id === course.id);
  const gmap = await groupVMsForCourses([course]);
  const vm = (gmap.get(course.id) ?? []).find((x) => x.id === id);
  if (!vm) return null;
  return {
    group: vm,
    course: {
      id: course.id,
      name: course.name,
      code: course.code,
      lecturer: course.lecturer,
      maxMembers: course.maxMembers,
      colorIndex: colorIndex < 0 ? 0 : colorIndex,
    },
  };
}

export async function listUnassigned(courseId: string): Promise<StudentVM[]> {
  const rows = await db
    .select()
    .from(students)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${memberships} m
        JOIN ${groups} g ON g.id = m.group_id
        WHERE m.student_id = ${students.id} AND g.course_id = ${courseId}
      )`
    )
    .orderBy(asc(students.nim));
  return rows.map((s) => ({
    id: s.id,
    nim: s.nim,
    name: s.name,
    checkedIn: s.token !== null,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function dashboardStats() {
  const [studentsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
  const cs = await listCourses();
  const groupCount = cs.reduce((s, c) => s + c.groupCount, 0);
  const fullGroupCount = cs.reduce((s, c) => s + c.fullGroupCount, 0);
  const inAnyGroup = await db
    .select({ count: sql<number>`count(distinct ${memberships.studentId})::int` })
    .from(memberships);
  const anyCount = inAnyGroup[0]?.count ?? 0;
  return {
    totalStudents: studentsCount?.count ?? 0,
    totalCourses: cs.length,
    totalGroups: groupCount,
    fullGroups: fullGroupCount,
    assigned: anyCount,
    unassignedGlobal: (studentsCount?.count ?? 0) - anyCount,
  };
}

/** Kelompok yang diikuti seorang mahasiswa (buat halaman "Kelompok Saya"). */
export async function getStudentGroups(studentId: string) {
  const rows = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      courseId: courses.id,
      courseName: courses.name,
      courseCode: courses.code,
      maxMembers: courses.maxMembers,
      joinedAt: memberships.joinedAt,
    })
    .from(memberships)
    .innerJoin(groups, eq(groups.id, memberships.groupId))
    .innerJoin(courses, eq(courses.id, groups.courseId))
    .where(eq(memberships.studentId, studentId))
    .orderBy(asc(memberships.joinedAt));

  if (rows.length === 0) return [];
  const groupIds = rows.map((r) => r.groupId);
  const counts = await db
    .select({ groupId: memberships.groupId, count: sql<number>`count(*)::int` })
    .from(memberships)
    .where(inArray(memberships.groupId, groupIds))
    .groupBy(memberships.groupId);
  const countMap = new Map(counts.map((c) => [c.groupId, c.count]));

  return rows.map((r) => ({
    groupId: r.groupId,
    groupName: r.groupName,
    courseId: r.courseId,
    courseName: r.courseName,
    courseCode: r.courseCode,
    maxMembers: r.maxMembers,
    memberCount: countMap.get(r.groupId) ?? 0,
    joinedAt: r.joinedAt.toISOString(),
  }));
}

/** cari group mahasiswa di course tertentu (validasi gabung). */
export async function studentGroupInCourse(courseId: string, studentId: string) {
  const rows = await db
    .select({ groupId: groups.id, groupName: groups.name })
    .from(memberships)
    .innerJoin(groups, eq(groups.id, memberships.groupId))
    .where(and(eq(groups.courseId, courseId), eq(memberships.studentId, studentId)))
    .limit(1);
  return rows[0] ?? null;
}
