import React, { useState, ReactNode } from 'react';

interface TabProps {
	title: string;
	children: ReactNode;
	active?: boolean;
}

const TabItem: React.FC<TabProps> = ({ children }) => {
	return <>{children}</>;
};

interface TabsProps {
	children: ReactNode;
}

// Rozszerzamy interfejs dla komponentu Tabs, dodając właściwość Item
interface TabsComponent extends React.FC<TabsProps> {
	Item: React.FC<TabProps>;
}

const Tabs: TabsComponent = ({ children }) => {
	const [activeTab, setActiveTab] = useState(0);

	// Filtrujemy tylko elementy, które są typu TabItem
	const tabItems = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) &&
			(child.type as React.ComponentType) === TabItem
	);

	const titles = tabItems.map((tab) => {
		if (React.isValidElement<TabProps>(tab)) {
			return tab.props.title;
		}
		return '';
	});

	return (
		<div>
			<div className='flex border-b'>
				{titles.map((title, index) => (
					<button
						key={index}
						className={`py-2 px-4 font-medium text-sm focus:outline-none ${
							index === activeTab
								? 'border-b-2 border-blue-500 text-blue-600'
								: 'text-gray-500 hover:text-gray-700'
						}`}
						onClick={() => setActiveTab(index)}
					>
						{title}
					</button>
				))}
			</div>
			<div className='py-4'>{tabItems[activeTab]}</div>
		</div>
	);
};

Tabs.Item = TabItem;

export default Tabs;
