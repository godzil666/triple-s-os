import { selectPresentationPartners } from '../domain/selectors'
import { useDemoContext } from './DemoContext'

export function usePresentationPartners() {
  return selectPresentationPartners(useDemoContext().state)
}
