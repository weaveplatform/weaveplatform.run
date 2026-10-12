export default {
  docs: [
    'start-here/index',
    {type: 'category', label: 'Platform', items: ['platform/architecture', 'platform/compatibility', 'platform/glossary', 'platform/repositories']},
    {type: 'category', label: 'Products', items: [
      {type: 'category', label: 'GuestWeave', items: ['products/guestweave/index', 'products/guestweave/macos', 'products/guestweave/windows', 'products/guestweave/windows-development']},
      'products/hostweave/hld', 'products/imageweave/hld', 'products/agent-core/hld', 'products/agent-modules/hld',
    ]},
    {type: 'category', label: 'Reference', items: ['reference/index', 'reference/contracts']},
    {type: 'category', label: 'Develop', items: ['development/architecture', 'development/documentation', 'development/roadmap']},
    {type: 'category', label: 'Operate', items: ['operations/publishing']},
  ],
};
