import db from '../config/db.js';

export const getPatientAppointments = async (req, res) => {
    try {
        const { customerId } = req.params; 
        const filter = req.query.filter || 'all';
        const sortOrder = req.query.sort || 'DESC';
        
        let searchDate = req.query.searchDate;
        if (!searchDate || String(searchDate).trim() === '' || searchDate === 'null' || searchDate === 'undefined') {
            searchDate = null;
        }

        const [rows] = await db.query(
            'CALL sp_ViewPatientAppointments(?, ?, ?, ?)',
            [customerId, filter, sortOrder, searchDate]
        );

        res.status(200).json({ 
            success: true, 
            data: rows[0] || [] 
        });
    } catch (error) {
        console.error("Error when calling getPatientAppointments", error);            
        res.status(500).json({ message: error.message || "System error" });
    }
}

export const getAvailableTimeslots = async (req, res) => {
    try {
        const { facilityId, branchId, date } = req.query;

        const [rows] = await db.query(
            'CALL sp_GetAvailableTimeslots(?, ?, ?)',
            [facilityId, branchId, date]
        );

        res.status(200).json({ 
            success: true, 
            data: rows[0] 
        });

    } catch (error) {
        console.error("Error when calling getAvailableTimeslots", error);            
        res.status(500).json({ message: error.message || "System error" })
    }
}


