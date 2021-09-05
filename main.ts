import {Transaction} from './index'

const scenario = [
  {
    index: 1,
    meta: {
      title: "Read popular customers",
      description:
        "This action is responsible for reading the most popular customers",
    },
    // callback for main execution
    call: async (store) => {},
    // callback for rollbacke
    restore: async (store) => {},
  },
  {
    index: 2,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer',
    },
    // callback for main execution
    call: async (store) => {},
    // callback for rollback
    restore: async (store) => {},
  },
];

const transaction = new Transaction();

(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []  
    } catch (err) {
        console.log(err);
    }
})();
