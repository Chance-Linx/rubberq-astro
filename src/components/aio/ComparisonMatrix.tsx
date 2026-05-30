import React from 'react';

interface ComparisonRow {
  feature: string;
  values: string[];
}

interface ComparisonMatrixProps {
  title?: string;
  headers: string[];
  rows: ComparisonRow[];
}

/**
 * ComparisonMatrix: 材料或工艺对比矩阵
 */
const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ title, headers, rows }) => {
  return (
    <div className="my-10">
      {title && <h3 className="text-lg font-bold mb-4 text-industrial-900 uppercase tracking-wider">{title}</h3>}
      <div className="overflow-x-auto border border-industrial-700 bg-white">
        <table className="min-w-full divide-y divide-industrial-200">
          <thead className="bg-industrial-50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left text-sm font-bold text-industrial-900 tracking-wider border-r border-industrial-200 ${
                    idx === 0 ? 'bg-industrial-100' : 'bg-industrial-50'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-industrial-200">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-industrial-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-industrial-900 bg-industrial-100 border-r border-industrial-200">
                  {row.feature}
                </td>
                {row.values.map((val, valIdx) => (
                  <td
                    key={valIdx}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-industrial-600 border-r border-industrial-200 last:border-r-0 ${
                      valIdx > 0 && val.includes('优异') ? 'text-accent-orange font-medium' :
                      valIdx > 0 && val.includes('差') ? 'text-accent-orange' : ''
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 优化说明 */}
      <div className="mt-6 text-xs text-industrial-500">
        <p>* 数据基于 IATF 16949, ASTM D2000, ISO 3601 标准测试</p>
        <p>* FKM 在高温和化学耐性方面显著优于 NBR</p>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
