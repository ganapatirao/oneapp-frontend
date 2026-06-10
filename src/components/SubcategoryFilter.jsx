import { useState } from 'react';

const SubcategoryFilter = ({ selectedCategory, categories, selectedSubcategory, onSubcategoryChange }) => {
  if (selectedCategory === 'All') return null;

  const category = categories.find(c => c.name === selectedCategory);
  if (!category?.subcategories || category.subcategories.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => onSubcategoryChange('All')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            selectedSubcategory === 'All'
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Subcategories
        </button>
        {category.subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => onSubcategoryChange(sub)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedSubcategory === sub
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryFilter;
