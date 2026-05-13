export const ReportSkeleton = () => (
  <div className="space-y-5" data-testid="report-skeleton">
    <div className="liquid-card p-7">
      <div className="h-3 w-24 rounded-full shimmer mb-3" />
      <div className="h-10 w-72 rounded-md shimmer" />
      <div className="h-3 w-full max-w-xl rounded-full shimmer mt-4" />
      <div className="h-3 w-2/3 max-w-md rounded-full shimmer mt-2" />
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
      {[0,1].map(i => (
        <div key={i} className="liquid-card p-6">
          <div className="h-3 w-28 rounded-full shimmer mb-5" />
          {[0,1,2,3].map(j => (
            <div key={j} className="mb-4">
              <div className="h-4 w-2/3 rounded shimmer" />
              <div className="h-3 w-full rounded shimmer mt-2" />
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="liquid-card p-6">
      <div className="h-3 w-32 rounded-full shimmer mb-4" />
      <div className="grid sm:grid-cols-5 gap-3">
        {[0,1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl shimmer" />)}
      </div>
    </div>
  </div>
);
