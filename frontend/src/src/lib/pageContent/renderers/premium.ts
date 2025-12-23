import { renderHero } from './basic'
import { renderFeatureGrid } from './collections'
import { renderStatsSection } from './statsTimeline'
import { renderTestimonials } from './team'
import { renderContentSection } from './basic'
import { renderTeamGrid } from './team'
import { renderPricingCards } from './pricing'

// Premium variants reuse base renderers to keep HTML consistent
export const renderPremiumHero = renderHero
export const renderPremiumFeatureGrid = renderFeatureGrid
export const renderPremiumStats = renderStatsSection
export const renderPremiumTestimonials = renderTestimonials
export const renderPremiumShowcase = renderContentSection
export const renderPremiumPartners = renderTeamGrid
export const renderPremiumPricing = renderPricingCards
