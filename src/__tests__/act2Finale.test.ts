import { describe, expect, it } from "vitest";
import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { getRelationshipChoiceScene } from "../systems/relationships/RelationshipChoiceScenes";
import {
  ACT2_FINALE_COMPLETION_FLAG,
  ACT2_SEAT_TOAST_SCENE_ID,
  ACT2_VANCE_FOLLOWUP_MESSAGE_ID,
  ACT2_VANCE_OFFER_SCENE_ID,
  beginAct2Finale,
  buildVanceCardFollowupMessage,
  completeAct2Finale,
  getAct2FinaleArrivalCopy,
  getAct2FinaleToast,
  getAct2SeatGate,
  getVanceOfferChoice,
  hasResolvedVanceOffer,
  isAct2FinaleComplete,
  isVanceOfferPending,
  resolveVanceOffer,
  type Act2FinaleToast,
  type VanceOfferChoice
} from "../systems/story/Act2Finale";
import type { LiveOpportunity, WorldState } from "../types";

function vanceReady(): WorldState {
  return buildDevProofBootState("act2_vance_offer_ready");
}

function finaleReady(branch: "protect" | "expose" = "protect"): WorldState {
  return buildDevProofBootState(branch === "protect" ? "act2_finale_protect_ready" : "act2_finale_expose_ready");
}

describe("Julian Vance's real-job offer", () => {
  it("triggers once only after the PDA reveal and stays residue-only for both choices", () => {
    const beforeReveal = buildDevProofBootState("act2_pda_reveal_ready");
    expect(isVanceOfferPending(beforeReveal)).toBe(false);

    for (const choice of ["decline", "take_card"] as VanceOfferChoice[]) {
      const world = vanceReady();
      const moneyBefore = world.players[world.localPlayerId].money;
      const reputationBefore = structuredClone(world.reputation);
      expect(isVanceOfferPending(world)).toBe(true);
      expect(resolveVanceOffer(world, choice, 35_000)).toBe(true);
      expect(resolveVanceOffer(world, choice, 35_001)).toBe(false);
      expect(hasResolvedVanceOffer(world)).toBe(true);
      expect(getVanceOfferChoice(world)).toBe(choice);
      expect(world.players[world.localPlayerId].money).toBe(moneyBefore);
      expect(world.reputation).toEqual(reputationBefore);
    }
  });

  it("offers a delayed one-time passive-aggressive Feed follow-up only for taking the card", () => {
    const card = vanceReady();
    expect(resolveVanceOffer(card, "take_card", 20_000)).toBe(true);
    expect(buildVanceCardFollowupMessage(card, 21_439)).toBeUndefined();
    const followup = buildVanceCardFollowupMessage(card, 21_440);
    expect(followup).toMatchObject({
      id: ACT2_VANCE_FOLLOWUP_MESSAGE_ID,
      from: "Julian Vance · Vanguard",
      body: expect.stringContaining("for now")
    });
    expect(appendOpportunityMessage(card.opportunities, followup!)).toBe(true);
    expect(buildVanceCardFollowupMessage(card, 30_000)).toBeUndefined();

    const declined = vanceReady();
    expect(resolveVanceOffer(declined, "decline", 20_000)).toBe(true);
    expect(buildVanceCardFollowupMessage(declined, 30_000)).toBeUndefined();
  });

  it("keeps Vance polite, condescending, number-aware, and limited to two non-mechanical choices", () => {
    const scene = getRelationshipChoiceScene(ACT2_VANCE_OFFER_SCENE_ID)!;
    expect(scene.options).toHaveLength(2);
    expect(scene.npcOpeningLine).toContain("Four-point-something under pressure");
    expect(scene.npcOpeningLine).toContain("noise problem");
    expect(scene.npcOpeningLine).toContain("Salary. Badge. Off the street. A real job.");
    expect(scene.options.map((option) => option.actionId)).toEqual([
      "decline_act2_vance_offer",
      "take_act2_vance_card"
    ]);
    expect(scene.options.every((option) => !option.axis && !option.affinityBonus && !option.energyDelta && !option.focusDelta)).toBe(true);
  });
});

describe("Act 2 sunset-seat gate", () => {
  it("requires both regular statuses, squeeze, PDA reveal, Vance scene, and the Sunday sunset window", () => {
    const ready = finaleReady();
    expect(getAct2SeatGate(ready)).toMatchObject({
      foundationComplete: true,
      vanceOfferComplete: true,
      sundaySunset: true,
      available: true,
      missing: []
    });

    const cases: Array<[string, (world: WorldState) => void, string]> = [
      ["Surf regular", (world) => delete world.questFlags[`crew:${ARI_SURF_RUN_CREW_ID}:regular`], "surf_regular"],
      ["Kitchen regular", (world) => delete world.questFlags[`crew:${KITCHEN_CIRCLE_CREW_ID}:regular`], "kitchen_regular"],
      ["squeeze", (world) => delete world.questFlags["act2:kitchen-circle:squeezeSeen"], "squeeze"],
      ["PDA reveal", (world) => delete world.questFlags["act2:pdaReveal:seen"], "pda_reveal"],
      ["Vance", (world) => delete world.questFlags["act2:vance:offerResolved"], "vance_offer"],
      ["Sunday sunset", (world) => { world.clock.day = 29; }, "sunday_sunset"]
    ];
    for (const [label, mutate, missing] of cases) {
      const world = finaleReady();
      mutate(world);
      expect(getAct2SeatGate(world).available, label).toBe(false);
      expect(getAct2SeatGate(world).missing, label).toContain(missing);
    }
  });

  it("is reachable across every tip, sourdough, no-questions, and Vance branch combination", () => {
    const tipBranches = ["return", "keep", "none"] as const;
    const sourdoughBranches = ["protect", "expose", "none"] as const;
    const noQuestionsBranches = ["completed", "missed", "accepted", "none"] as const;
    const vanceBranches = ["take_card", "decline"] as const;

    for (const tip of tipBranches) {
      for (const sourdough of sourdoughBranches) {
        for (const noQuestions of noQuestionsBranches) {
          for (const vance of vanceBranches) {
            const world = finaleReady();
            applyTipBranch(world, tip);
            applySourdoughBranch(world, sourdough);
            applyNoQuestionsBranch(world, noQuestions);
            applyVanceBranch(world, vance);
            expect(getAct2SeatGate(world).available, `${tip}/${sourdough}/${noQuestions}/${vance}`).toBe(true);
          }
        }
      }
    }
  });
});

describe("Act 2 finale branch copy and handoff", () => {
  it("surfaces only branch history that actually exists in the save", () => {
    const returnedProtect = finaleReady("protect");
    const protectCopy = getAct2FinaleArrivalCopy(returnedProtect);
    expect(protectCopy).toContain("I said it to the printer twice");
    expect(protectCopy).toContain("villa gate sent this back with your name");
    expect(protectCopy).toContain("blank-manifest route label");
    expect(protectCopy).toContain("Somebody's still chasing surge");
    expect(protectCopy).toContain("shifts without asking");

    const keptExpose = finaleReady("expose");
    applyTipBranch(keptExpose, "keep");
    applyNoQuestionsBranch(keptExpose, "missed");
    const exposeCopy = getAct2FinaleArrivalCopy(keptExpose);
    expect(exposeCopy).toContain("Mine—and ours");
    expect(exposeCopy).toContain("closed wallet adjustment");
    expect(exposeCopy).toContain("pushed a cash run back");
    expect(exposeCopy).not.toContain("villa gate sent this back");
    expect(exposeCopy).not.toContain("blank-manifest route label");

    const noHistory = finaleReady();
    applyTipBranch(noHistory, "none");
    applyNoQuestionsBranch(noHistory, "none");
    applySourdoughBranch(noHistory, "none");
    const neutralCopy = getAct2FinaleArrivalCopy(noHistory);
    expect(neutralCopy).toContain("My name. Start there");
    expect(neutralCopy).not.toContain("wallet adjustment");
    expect(neutralCopy).not.toContain("cash run");
    expect(neutralCopy).not.toContain("blank-manifest");
  });

  it.each(["make_room", "serve_ourselves", "stay_longer"] as Act2FinaleToast[])(
    "completes through the warm %s toast without changing mechanics or advancing the act",
    (toast) => {
      const world = finaleReady();
      const playerBefore = structuredClone(world.players[world.localPlayerId]);
      const reputationBefore = structuredClone(world.reputation);
      const relationshipsBefore = structuredClone(world.relationships);
      expect(beginAct2Finale(world)).toBe(true);
      expect(completeAct2Finale(world, toast, 50_000)).toMatchObject({ ok: true, toast });
      expect(world.questFlags[ACT2_FINALE_COMPLETION_FLAG]).toBe(true);
      expect(getAct2FinaleToast(world)).toBe(toast);
      expect(isAct2FinaleComplete(world)).toBe(true);
      expect(world.life.actProgress.currentAct).toBe(2);
      expect(world.players[world.localPlayerId]).toEqual(playerBefore);
      expect(world.reputation).toEqual(reputationBefore);
      expect(world.relationships).toEqual(relationshipsBefore);
      expect(completeAct2Finale(world, toast, 50_001).ok).toBe(false);
    }
  );

  it("exposes exactly three consequence-free warm toast flavors", () => {
    const scene = getRelationshipChoiceScene(ACT2_SEAT_TOAST_SCENE_ID)!;
    expect(scene.options).toHaveLength(3);
    expect(scene.options.map((option) => option.actionId)).toEqual([
      "toast_act2_make_room",
      "toast_act2_serve_ourselves",
      "toast_act2_stay_longer"
    ]);
    expect(scene.options.every((option) => !option.axis && !option.affinityBonus && !option.energyDelta && !option.focusDelta)).toBe(true);
  });
});

function applyTipBranch(world: WorldState, branch: "return" | "keep" | "none"): void {
  delete world.collectedPickups.act1_luxury_tip_returned;
  delete world.collectedPickups.act1_luxury_tip_kept;
  if (branch === "return") world.collectedPickups.act1_luxury_tip_returned = 1;
  if (branch === "keep") world.collectedPickups.act1_luxury_tip_kept = 1;
}

function applySourdoughBranch(world: WorldState, branch: "protect" | "expose" | "none"): void {
  delete world.questFlags["act2:kadek:sourdough:protect"];
  delete world.questFlags["act2:kadek:sourdough:expose"];
  if (branch === "protect") world.questFlags["act2:kadek:sourdough:protect"] = true;
  if (branch === "expose") world.questFlags["act2:kadek:sourdough:expose"] = true;
}

function applyNoQuestionsBranch(world: WorldState, branch: "completed" | "missed" | "accepted" | "none"): void {
  world.opportunities.completedTemplateIds = world.opportunities.completedTemplateIds.filter((id) => id !== "no_questions_package");
  world.opportunities.missedTemplateIds = world.opportunities.missedTemplateIds.filter((id) => id !== "no_questions_package");
  world.opportunities.live = world.opportunities.live.filter((entry) => entry.templateId !== "no_questions_package");
  if (branch === "completed") world.opportunities.completedTemplateIds.push("no_questions_package");
  if (branch === "missed") world.opportunities.missedTemplateIds.push("no_questions_package");
  if (branch === "accepted") {
    world.opportunities.live.push({
      id: "no-questions:finale-test",
      templateId: "no_questions_package",
      status: "accepted",
      spawnedAt: 1,
      expiresAt: 999_999,
      locationVenueId: "bali_family_rental_scooter"
    } satisfies LiveOpportunity);
  }
}

function applyVanceBranch(world: WorldState, branch: "take_card" | "decline"): void {
  delete world.questFlags["act2:vance:cardTaken"];
  delete world.questFlags["act2:vance:declined"];
  world.questFlags[branch === "take_card" ? "act2:vance:cardTaken" : "act2:vance:declined"] = true;
}
