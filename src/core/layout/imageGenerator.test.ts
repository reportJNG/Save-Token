import { describe, expect, it } from 'vitest'
import { computePagination } from './pagination'
import { buildDrawPlan, DEFAULT_RENDER_STYLE } from './imageGenerator'

describe('buildDrawPlan', () => {
  it('produces one draw plan per page carrying the correct character slice', () => {
    const text = 'a'.repeat(50)
    const pagination = computePagination(text.length, {
      cell: { width: 10, height: 20 },
      mode: 'compact',
      targetAspect: 1,
      maxPageWidth: 2048,
      maxPageHeight: 2048,
    })

    const plans = buildDrawPlan(text, pagination.pages, { width: 10, height: 20 }, DEFAULT_RENDER_STYLE)

    expect(plans).toHaveLength(1)
    expect(plans[0].characterCount).toBe(50)
    expect(plans[0].rows.join('').length).toBe(50)
    expect(plans[0].canvasWidth).toBe(plans[0].gridWidth + DEFAULT_RENDER_STYLE.padding * 2)
  })
})
