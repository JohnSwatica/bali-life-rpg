export interface VenueInteractionNode {
  venueId: string;
  x: number;
  y: number;
  radius: number;
}

const INTERACTION_GAP_PX = 8;

/** Cap compressed authored-storefront footprints so distinct venues never compete at one point. */
export function capVenueInteractionFootprints<T extends VenueInteractionNode>(nodes: T[]): T[] {
  return nodes.map((node, index) => {
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let otherIndex = 0; otherIndex < nodes.length; otherIndex += 1) {
      if (otherIndex === index) continue;
      const other = nodes[otherIndex];
      nearestDistance = Math.min(nearestDistance, Math.hypot(node.x - other.x, node.y - other.y));
    }
    const safeRadius = Number.isFinite(nearestDistance)
      ? Math.max(0, (nearestDistance - INTERACTION_GAP_PX) / 2)
      : node.radius;
    return { ...node, radius: Math.min(node.radius, safeRadius) };
  });
}

export function findOverlappingVenueInteractionFootprints(nodes: VenueInteractionNode[]): string[] {
  const overlaps: string[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
      const left = nodes[index];
      const right = nodes[otherIndex];
      if (Math.hypot(left.x - right.x, left.y - right.y) < left.radius + right.radius) {
        overlaps.push(`${left.venueId}:${right.venueId}`);
      }
    }
  }
  return overlaps;
}
