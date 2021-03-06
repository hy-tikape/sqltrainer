progression = [
    {
        id: "A",
        tasks: ['001', '002', '003', '004', '005', '006', '007', '008'],
        requires: []
    },
    {
        id: "B",
        tasks: ['009', '010', '011', '012'],
        requires: ["A"]
    },
    {
        id: "C",
        tasks: ['013', '014', '015', '016', '017'],
        requires: ["B"]
    },
    {
        id: "D",
        tasks: ['018', '019', '020', '021', '022', '023', '024', '025'],
        requires: ["C"]
    },
    {
        id: "E",
        tasks: ['026', '027', '028', '029', '030'],
        requires: ["D"]
    },
    {
        id: "F",
        tasks: ['031', '032', '033', '034', '035'],
        requires: ["E"]
    },
    {
        id: "G",
        tasks: ['036', '037', '038', '039', '040', '041', '042', '043'],
        requires: ["F"]
    },
    {
        id: "H",
        tasks: ['044', '045', '046', '047', '048'],
        requires: ["G"]
    },
    {
        id: "I",
        tasks: ['049', '050', '051', '052', '053', '054', '055', '056'],
        requires: ["H"]
    },
    {
        id: "J",
        tasks: ['057', '058', '059', '060'],
        requires: ["I"]
    },
    {
        id: "X",
        tasks: [
            '061', '062', '063', '064', '065', '066', '067', '068', '069', '070',
            '071', '072', '073', '074', '075', '076', '077', '078', '079', '080',
            '081', '082', '083', '084', '085', '086', '087', '088', '089', '090',
            '091', '092', '093', '094', '095', '096', '097', '098', '099', '100'
        ],
        requires: ["J"]
    }
]