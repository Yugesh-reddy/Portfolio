const CHANH_DAI_MARK_VIEW_WIDTH = 556

export function scaleIsometricDetail(
  referenceUnits: number,
  targetViewBoxWidth: number
) {
  return (referenceUnits * targetViewBoxWidth) / CHANH_DAI_MARK_VIEW_WIDTH
}

export function getIsometricParityMetrics(targetViewBoxWidth: number) {
  const detailScale = scaleIsometricDetail(1, targetViewBoxWidth)

  return {
    detailScale,
    strokeWidth: detailScale,
    patternSize: 10 * detailScale,
    patternScale: detailScale,
    guideDasharray: [4 * detailScale, 2 * detailScale] as const,
    spotlightRadius: 200 * detailScale,
    pressDistance: 16 * detailScale,
  }
}
