import ReliefApp from './App'
import TraceApp from './trace/TraceApp'

export default function Root() {
  const app = new URLSearchParams(window.location.search).get('app')
  return app === 'relief' ? <ReliefApp /> : <TraceApp />
}
