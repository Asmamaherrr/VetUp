export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    </div>
  )
}
