import React from 'react';
import { useParams } from 'react-router-dom';
import ComplaintList from './ComplaintList';
import { getCategoryKeyFromSlug } from './complaintCategories';

const ComplaintCategoryPage = () => {
  const { categoryKey } = useParams();
  const normalizedCategory = getCategoryKeyFromSlug(categoryKey);

  return <ComplaintList defaultCategory={normalizedCategory} />;
};

export default ComplaintCategoryPage;
