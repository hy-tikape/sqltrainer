progression = [
    {
        id: "A",
        tasks: ['001', '002', '003'],
        requires: []
    },
    {
        id: "B",
        tasks: ['004', '005', '006', '007', '008'],
        requires: ["A"]
    },
    {
        id: "C",
        tasks: ['010', '011', '009', '012'],
        requires: ["B"]
    },
    {
        id: "D",
        tasks: ['013', '014'],
        requires: ["B"]
    },
    {
        id: "E",
        tasks: ['015', '016', '017', '018', '019', '020', '021', '022'],
        requires: ["C"]
    },
    {
        id: "F",
        tasks: ['023', '024', '025'],
        requires: ["C"]
    },
    {
        id: "G",
        tasks: ['026', '027', '028', '029', '030', '031', '032', '033', '034'],
        requires: ["D"]
    },
    {
        id: "H",
        tasks: ['035', '036', '037', '038'],
        requires: ["D"]
    },
    {
        id: "I",
        tasks: [],
        requires: ["F", "G"]
    },
    {
        id: "J",
        tasks: [],
        requires: ["I"]
    },
    {
        id: "K",
        tasks: [],
        requires: ["I"]
    },
    {
        id: "L",
        tasks: [],
        requires: ["I"]
    },
    {
        id: "X",
        tasks: [],
        requires: ["J", "K", "L"]
    }
]