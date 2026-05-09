import React from 'react';

interface TechnicalProperty {
  name: string;
  value: string;
}

interface TechnicalTableProps {
  title?: string;
  data: TechnicalProperty[];
}

/**
 * TechnicalTable: 结构化技术参数“数据岛” (Data Island)
 */
const TechnicalTable: React.FC<TechnicalTableProps> = ({ title, data }) => {
  return (
    <div className="technical-data-island my-8 overflow-hidden border border-industrial-700 rounded-lg">
      {title && (
        <div className="bg-industrial-900 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wider">
          {title}
        </div>
      )}
      <table className="min-w-full divide-y divide-industrial-700">
        <tbody className="bg-white divide-y divide-industrial-100">
          {data.map((prop, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-industrial-100/50'}>
              <td className="px-6 py-4 text-sm font-semibold text-industrial-900 w-1/3 border-r border-industrial-100">
                {prop.name}
              </td>
              <td className="px-6 py-4 text-sm text-industrial-600 font-mono">
                {prop.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicalTable;
