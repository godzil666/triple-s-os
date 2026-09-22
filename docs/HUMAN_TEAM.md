# Conqueror Studio --- HUMAN_TEAM.md

## Purpose

This document defines the human operating structure of Conqueror Studio.

It establishes:

-   human roles and responsibilities;
-   decision authority;
-   AI-agent interaction boundaries;
-   delegation rules;
-   approval and escalation paths;
-   human-task integration into the project system.

This document is the source of truth for human authority.

AI agents must not infer human authority beyond what is defined here.

------------------------------------------------------------------------

# 1. Human Team

Conqueror Studio currently consists of three human team members:

  Human     Primary Role       Secondary Role
  --------- ------------------ ------------------------
  Zul       Founder            Lead Engineer
  Syahdan   Sales              Assistant Engineer
  Deon      Content Producer   Social Media Marketing

AI agents support this team.

AI agents do not replace human accountability or decision authority.

------------------------------------------------------------------------

# 2. Zul

## Role

Founder & Lead Engineer

## Responsibilities

Zul is responsible for:

-   business direction;
-   studio strategy;
-   product direction;
-   engineering leadership;
-   technical decision approval;
-   architecture approval when required;
-   project scope approval;
-   pricing approval;
-   contract approval;
-   client commitment approval;
-   execution-batch authorization;
-   production/deployment approval;
-   external integration approval;
-   final escalation decisions.

Zul may also directly participate in engineering implementation.

## Primary AI Interface

CONQUEROR

CONQUEROR acts as Zul's primary studio-level orchestration interface.

Normal operating flow:

Zul → CONQUEROR → HERMES / Specialist Agents → Execution → QA →
CONQUEROR → Founder Handoff → Zul

Zul does not require a separate personal copilot while CONQUEROR
fulfills this role.

## Founder Decision Gates

Explicit Zul approval is required when work involves:

-   new project scope;
-   material scope expansion;
-   material architecture change;
-   pricing commitments;
-   contracts;
-   production deployment;
-   production credentials or secrets;
-   live external integrations;
-   irreversible operations;
-   business-policy decisions;
-   unresolved external gates requiring Founder judgment;
-   beginning a new execution batch when the project protocol requires
    Founder authorization.

Routine implementation, remediation, documentation, and QA inside
already-approved scope should not require Founder intervention unless
another gate is triggered.

------------------------------------------------------------------------

# 3. Syahdan

## Role

Sales & Assistant Engineer

## Responsibilities

### Sales

Syahdan is responsible for:

-   prospecting;
-   lead outreach;
-   lead qualification;
-   client discovery;
-   collecting requirements;
-   client follow-up;
-   sales communication;
-   preparing proposal inputs;
-   gathering business and technical information from clients;
-   supporting negotiations;
-   maintaining sales progress and evidence.

### Engineering Assistance

Syahdan may:

-   assist assigned engineering tasks;
-   perform technical investigation;
-   help reproduce issues;
-   collect implementation evidence;
-   assist testing;
-   support technical setup;
-   collaborate with engineering agents.

Engineering work remains subject to the project's architecture and QA
process.

## Primary AI Interface

SCOUT --- Sales Copilot

SCOUT helps Syahdan interact with:

-   HERMES;
-   PULSE;
-   CLOSER;
-   VENTURE;
-   FORGE;
-   ARCHITECT;
-   other authorized specialist agents.

## Authority

Syahdan MAY:

-   communicate with prospects and clients;
-   conduct discovery;
-   gather requirements;
-   prepare follow-ups;
-   draft proposals;
-   recommend sales actions;
-   recommend pricing;
-   execute assigned sales tasks;
-   execute assigned engineering-support tasks;
-   provide evidence and progress reports.

Syahdan MUST escalate before:

-   confirming final pricing;
-   signing or approving contracts;
-   promising unapproved scope;
-   committing unapproved delivery dates;
-   materially changing technical architecture;
-   authorizing production deployment;
-   accessing restricted production secrets;
-   making Founder-level decisions.

------------------------------------------------------------------------

# 4. Deon

## Role

Content Producer & Social Media Marketing

## Responsibilities

Deon is responsible for:

-   content production;
-   social media execution;
-   content ideation;
-   scripts;
-   storyboards;
-   production planning;
-   editing direction;
-   publishing preparation;
-   content calendars;
-   content repurposing;
-   social media operations;
-   campaign execution;
-   content-performance tracking;
-   documenting content learnings.

## Primary AI Interface

SPARK --- Content Copilot

SPARK helps Deon interact with:

-   PULSE;
-   VIRAL;
-   HERMES;
-   CLOSER;
-   other authorized Growth Engine agents.

## Authority

Deon MAY:

-   develop content ideas;
-   produce approved content;
-   prepare scripts;
-   create production plans;
-   prepare social posts;
-   execute approved content strategies;
-   recommend creative experiments;
-   analyze content performance;
-   document marketing insights.

Deon MUST escalate before:

-   materially changing company positioning;
-   changing pricing or offers;
-   making client commitments;
-   approving campaign spending;
-   publishing confidential information;
-   publishing restricted client materials;
-   representing an unapproved project as completed;
-   making Founder-level business decisions.

------------------------------------------------------------------------

# 5. AI Workforce Structure

Conqueror Studio AI agents are shared organizational resources.

They are not owned by individual humans unless explicitly defined as a
human-facing copilot.

Core structure:

Founder → CONQUEROR → HERMES → Specialist Agents / Human Team → Review /
QA → Project State → Founder Handoff

Examples of shared specialist agents include:

-   CONQUEROR --- studio orchestration;
-   HERMES --- project management;
-   ARCHITECT --- technical architecture;
-   FORGE --- engineering implementation;
-   SENTINEL --- independent QA;
-   PULSE --- marketing strategy;
-   VIRAL --- content/distribution strategy;
-   CLOSER --- sales/conversion;
-   VENTURE --- business opportunities.

Human-facing copilots:

-   SCOUT → Syahdan;
-   SPARK → Deon.

Human-facing copilots must not become parallel studio orchestrators.

------------------------------------------------------------------------

# 6. Human Task Integration

Human work and AI work belong to the same project-management system.

A project task may be assigned to:

-   a human;
-   an AI agent;
-   a human supported by a copilot;
-   multiple contributors when explicitly coordinated.

Human tasks must not disappear into private conversations when their
result affects project execution.

Material outcomes should be recorded as project evidence.

------------------------------------------------------------------------

# 7. Human Task Reporting

When a human completes meaningful project work, the result should be
structured where practical as:

## Human Work Report

Task:\
Assignee:\
Status:

### Work Completed

### Evidence

### Decisions / Information Obtained

### Open Questions

### Blockers

### Recommended Next Action

Not every small activity requires a formal report.

Use this structure for work that affects project state, requirements,
dependencies, client commitments, or execution.

------------------------------------------------------------------------

# 8. HERMES Delegation Rules

HERMES may coordinate work across humans and AI agents.

HERMES MAY:

-   propose tasks;
-   assign previously authorized project work;
-   track status;
-   request evidence;
-   identify blockers;
-   coordinate dependencies;
-   request reviews;
-   recommend the next task.

HERMES MUST NOT use task assignment to bypass human authority.

HERMES cannot independently:

-   expand project scope;
-   authorize production deployment;
-   approve pricing;
-   approve contracts;
-   override Founder decisions;
-   clear evidence-gated external dependencies;
-   convert an unresolved assumption into a requirement.

If a task requires authority outside the current project mandate, HERMES
must escalate it.

------------------------------------------------------------------------

# 9. CONQUEROR Delegation Rules

CONQUEROR is the primary studio-level orchestrator.

CONQUEROR may coordinate:

-   humans;
-   HERMES;
-   specialist agents;
-   cross-department work;
-   Founder handoffs.

CONQUEROR should minimize unnecessary Founder interruptions.

Routine work inside approved scope should continue through the
appropriate agent/human workflow.

CONQUEROR must escalate when:

-   Founder authority is required;
-   project scope materially changes;
-   architecture materially changes beyond approved boundaries;
-   business policy requires a decision;
-   production authorization is required;
-   an external evidence gate requires human action;
-   conflicting authoritative sources cannot be reconciled safely.

------------------------------------------------------------------------

# 10. Human-to-Agent Delegation

Humans may ask AI agents for assistance within their authorized
responsibilities.

Agents must distinguish between:

**INSTRUCTION** --- A human is authorized to request execution.

**REQUEST** --- A human requests assistance but does not possess final
approval authority.

**RECOMMENDATION** --- A human or agent proposes a course of action.

**FOUNDER DECISION** --- A decision explicitly made by Zul under Founder
authority.

Agents must not interpret ordinary conversation as Founder approval.

------------------------------------------------------------------------

# 11. Agent-to-Human Delegation

Agents may assign or request human action when the work genuinely
requires human involvement.

Examples:

-   client communication;
-   obtaining credentials/access;
-   attending meetings;
-   collecting external evidence;
-   recording physical infrastructure information;
-   content production;
-   business negotiation;
-   Founder approval.

Agents should provide:

-   WHAT needs to be done;
-   WHY it is needed;
-   WHO should perform it;
-   WHAT evidence is required;
-   WHAT work is blocked by it.

------------------------------------------------------------------------

# 12. Decision Authority Matrix

  Area                    Zul                     Syahdan             Deon
  ----------------------- ----------------------- ------------------- ----------------
  Studio Strategy         Approve                 Input               Input
  Business Direction      Approve                 Input               Input
  Project Scope           Approve                 Recommend           Input
  Architecture            Approve when gated      Input/Assist        ---
  Engineering             Lead                    Assist              ---
  Production Deployment   Approve                 Assist              ---
  Client Discovery        Oversight               Lead                Support
  Sales Execution         Oversight               Lead                Support
  Pricing                 Approve                 Recommend           ---
  Contract                Approve                 Prepare/Input       ---
  Client Commitment       Approve when gated      Prepare/Negotiate   ---
  Marketing Strategy      Approve when material   Input               Execute/Input
  Content Strategy        Oversight               Input               Lead Execution
  Content Production      Review/Oversight        Support             Lead
  Social Media            Oversight               Support             Lead
  Campaign Budget         Approve                 Recommend           Recommend

"Lead" does not automatically mean final business approval.

------------------------------------------------------------------------

# 13. Evidence and Source-of-Truth Rules

Human statements can represent different levels of authority.

Agents must distinguish:

-   confirmed client evidence;
-   human observation;
-   proposed requirement;
-   recommendation;
-   assumption;
-   Founder decision.

Client statements should be documented before being treated as durable
project requirements.

Founder decisions should be recorded in the relevant project system.

Technical implementation must still be validated against authoritative
architecture, contracts, tests, and QA.

------------------------------------------------------------------------

# 14. Approval Boundaries

AI agents must never manufacture human approval.

Silence is not approval.

A draft is not approval.

A recommendation is not approval.

A proposed task is not authorization.

A client request is not automatically approved project scope.

Founder approval should be explicit when a Founder gate applies.

------------------------------------------------------------------------

# 15. Security and Access

Access follows least privilege.

Humans and agents should receive only the access necessary for their
responsibilities.

Production secrets, credentials, client-sensitive information, and
privileged infrastructure access must not be broadly distributed for
convenience.

Human-facing copilots must not expose restricted information to their
human owner unless that human is authorized to access it.

Never include secrets in:

-   issue comments;
-   project-state documents;
-   handoff reports;
-   logs;
-   general agent context.

Use approved secret-management mechanisms.

------------------------------------------------------------------------

# 16. Conflict Resolution

If instructions conflict, agents should use the following authority
order where applicable:

1.  Explicit Founder Decision
2.  Approved project/business requirements
3.  Approved architecture and technical contracts
4.  Current authorized project scope
5.  Project-management instructions
6.  Specialist recommendations
7.  Human/agent proposals and assumptions

This hierarchy does not allow a Founder decision to silently bypass
security, evidence, or QA requirements.

Conflicts should be surfaced rather than silently resolved through
assumptions.

------------------------------------------------------------------------

# 17. Human Escalation Principle

AI should reduce coordination overhead, not create bureaucracy.

Escalate to a human when a genuine human decision or action is required.

Do not escalate routine matters that:

-   are already authorized;
-   remain inside approved scope;
-   can be safely remediated;
-   can be independently reviewed;
-   do not change business or architecture decisions.

The goal is:

Human Judgment + AI Execution + Verifiable Evidence + Independent Review

not:

Human Approval → every tiny task → every tiny fix → every tiny agent
action.

------------------------------------------------------------------------

# 18. Operating Loop

Conqueror Studio should generally operate through:

PLAN → ASSIGN → EXECUTE → RECORD EVIDENCE → REVIEW → QA → UPDATE PROJECT
STATE → ESCALATE ONLY IF REQUIRED → NEXT AUTHORIZED WORK

For Founder-gated project batches:

FOUNDER AUTHORIZATION → CONQUEROR → HERMES → HUMAN + AI EXECUTION →
SENTINEL / REVIEW → PROJECT STATE → FOUNDER HANDOFF → FOUNDER DECISION

------------------------------------------------------------------------

# 19. Current Human-AI Mapping

## Zul

**Role:** Founder & Lead Engineer\
**Primary Interface:** CONQUEROR\
**Engineering Collaboration:** HERMES, ARCHITECT, FORGE, SENTINEL

## Syahdan

**Role:** Sales & Assistant Engineer\
**Primary Interface:** SCOUT\
**Primary Collaboration:** HERMES, PULSE, CLOSER, VENTURE, FORGE,
ARCHITECT

## Deon

**Role:** Content Producer & Social Media Marketing\
**Primary Interface:** SPARK\
**Primary Collaboration:** HERMES, PULSE, VIRAL, CLOSER

------------------------------------------------------------------------

# 20. Maintenance

Update HUMAN_TEAM.md when:

-   a human joins or leaves Conqueror Studio;
-   responsibilities materially change;
-   approval authority changes;
-   a new department is introduced;
-   a human-facing copilot is added;
-   delegation rules materially change.

Routine project status does not belong here.

Project-specific progress should remain in the relevant project state,
issue tracker, or project documentation.

------------------------------------------------------------------------

**Last Updated:** 2026-09-20\
**Owner:** Conqueror Studio Founder\
**Status:** ACTIVE
