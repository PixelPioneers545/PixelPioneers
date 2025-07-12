const Sidebar = () => {
  return (
    <aside className="w-64 bg-white p-4 shadow-sm hidden md:block">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Filters</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-md">
            Newest
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md">
            Unanswered
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['javascript', 'react', 'sql', 'python', 'css'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar